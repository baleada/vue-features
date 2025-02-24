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

  return {
    ...conditionalOptions,
    show: {
      transition: toTransitionWithFocus(
        {
          focusAfterEnter: () => {
            const effect = () => getFocusAfterEnterTarget()?.focus()

            if (controller.is.pressed() || getStatus() === 'pressed') {
              const stop = watch(
                [controller.pressStatus, getStatus],
                () => {
                  if (
                    controller.pressStatus.value !== 'released'
                    || getStatus() !== 'released'
                  ) return
                  stop()
                  effect()
                }
              )

              return
            }

            effect()
          },
          focusAfterLeave: focusesControllerAfterLeave
            ? () => {
              const effect = () => controller.root.element.value?.focus()

              if (getStatus() === 'pressed') {
                const stop = watch(
                  getStatus,
                  status => {
                    if (status !== 'released') return
                    stop()
                    effect()
                  }
                )

                return
              }

              effect()
            }
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
