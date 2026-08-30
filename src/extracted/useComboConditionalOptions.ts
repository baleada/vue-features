import { inject, watch } from 'vue'
import type { UseConditionalOptions } from '../extensions'
import type { Menu, Modal, Select } from '../combos'
import { toTransitionWithFocus } from './toTransitionWithFocus'
import {
  defaultPressInjection,
  pressInjectionKey,
} from './delegatePress'
import type { SupportedElement } from './toRenderedKind'
import { narrowTransitionOption } from './narrowTransitionOption'
import type { ElementApi } from './useElementApi'

export function useComboConditionalOptions (
  {
    conditionalOptions,
    controller,
    getFocusAfterEnterTarget,
    focusesControllerAfterLeave,
    popupRoot,
  }: {
    conditionalOptions: UseConditionalOptions,
    controller: Select['button'] | Menu['button'] | Modal['button'],
    getFocusAfterEnterTarget: () => SupportedElement,
    focusesControllerAfterLeave: boolean,
    popupRoot: ElementApi<SupportedElement>,
  }
) {
  const { getStatus } = inject(pressInjectionKey, defaultPressInjection)

  // Focus effects wait for any in-flight press to be released, so that the
  // browser's own focus handling doesn't clobber them.
  //
  // A pending effect is scoped to the press and the popup that scheduled it. It
  // is abandoned as soon as either moves on—otherwise it outlives its press and
  // steals focus during a later, unrelated one, yanking the user out of
  // whatever they've opened in the meantime.
  let stopPending: () => void

  const abandonPending = () => {
          stopPending?.()
          stopPending = undefined
        },
        deferUntilReleased = (
          { watchSources, predicateReleased, predicateStillRelevant, effect }: {
            watchSources: Parameters<typeof watch>[0],
            predicateReleased: () => boolean,
            predicateStillRelevant: (activeElementWhenDeferred: Element) => boolean,
            effect: () => void,
          }
        ) => {
          abandonPending()

          if (predicateReleased()) {
            effect()
            return
          }

          const activeElementWhenDeferred = document.activeElement,
                stopWatchingPress = watch(
                  watchSources,
                  () => {
                    if (!predicateReleased()) return

                    abandonPending()

                    if (!predicateStillRelevant(activeElementWhenDeferred)) return

                    effect()
                  }
                ),
                stopWatchingPopup = watch(
                  popupRoot.element,
                  () => abandonPending()
                )

          stopPending = () => {
            stopWatchingPress()
            stopWatchingPopup()
          }
        }

  return {
    ...conditionalOptions,
    show: {
      transition: toTransitionWithFocus(
        {
          focusAfterEnter: () => deferUntilReleased({
            watchSources: [controller.pressStatus, getStatus],
            predicateReleased: () => (
              !controller.is.pressed()
              && getStatus() !== 'pressed'
            ),
            // Focus only moves into the popup if nothing has claimed it since
            // the press began.
            predicateStillRelevant: activeElementWhenDeferred => (
              document.activeElement === activeElementWhenDeferred
              || document.activeElement === controller.root.element.value
              || predicateUnclaimed(document.activeElement)
            ),
            effect: () => getFocusAfterEnterTarget()?.focus(),
          }),
          focusAfterLeave: focusesControllerAfterLeave
            ? () => deferUntilReleased({
              watchSources: getStatus,
              predicateReleased: () => getStatus() !== 'pressed',
              // Focus only returns to the controller if nothing has claimed it
              // since the popup started leaving.
              predicateStillRelevant: activeElementWhenDeferred => (
                document.activeElement === activeElementWhenDeferred
                || predicateUnclaimed(document.activeElement)
              ),
              effect: () => controller.root.element.value?.focus(),
            })
            : () => {},
        },
        {
          transition: narrowTransitionOption(
            popupRoot.element,
            conditionalOptions?.show?.transition || {}
          ),
        }
      ),
    },
  }
}

// Focus that has landed on the body, or on an element that has since been
// removed from the document, belongs to nobody.
function predicateUnclaimed (element: Element) {
  return !element
    || element === document.body
    || !document.contains(element)
}
