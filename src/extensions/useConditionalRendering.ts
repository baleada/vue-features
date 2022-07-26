import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { show } from '../affordances'
import type { ShowOptions } from '../affordances'
import { ensureElementFromExtendable, toTransitionWithEffects } from "../extracted"
import type { Extendable, TransitionEffects } from "../extracted"

export type ConditionalRendering = {
  render: () => any,
  remove: () => any,
  toggle: () => any,
  status: ComputedRef<ConditionalRenderingStatus>,
  is: {
    rendered: () => boolean,
    removed: () => boolean,
    transitioning: () => boolean,
  }
}

type ConditionalRenderingStatus = 'transitioning' | 'rendered' | 'removed'

export type UseConditionalRenderingOptions = {
  initialRenders?: boolean,
  show?: ShowOptions<Ref<HTMLElement>>
}

const defaultOptions: UseConditionalRenderingOptions = {
  initialRenders: true,
  show: {},
}

export function useConditionalRendering (
  extendable: Extendable,
  options: UseConditionalRenderingOptions = {},
): ConditionalRendering {
  const { initialRenders, show: showOptions } = { ...defaultOptions, ...options }

  const element = ensureElementFromExtendable(extendable),
        condition = ref(initialRenders),
        status = ref<ConditionalRendering['status']['value']>(condition.value ? 'rendered' : 'removed'),
        render: ConditionalRendering['render'] = () => {
          status.value = 'transitioning'
          condition.value = true
        },
        remove: ConditionalRendering['remove'] = () => {
          condition.value = false
        },
        toggle: ConditionalRendering['toggle'] = () => {
          if (condition.value) remove()
          else render()
        },
        appearAndEnterJsEffects: TransitionEffects<typeof element>['appear']['js'] = {
          before: () => status.value = 'transitioning',
          after: () => status.value = 'rendered',
          cancel: () => status.value = 'removed',
          active: (...args) => {
            const done = args[args.length - 1]
            done()
          }
        },
        appearAndEnterEffects: TransitionEffects<typeof element>['appear'] = {
          none: appearAndEnterJsEffects,
          js: appearAndEnterJsEffects,
          css: {
            start: () => status.value = 'transitioning',
            end: () => status.value = 'rendered',
            cancel: () => status.value = 'removed',
          }
        },
        leaveJsEffects: TransitionEffects<typeof element>['leave']['js'] = {
          before: () => status.value = 'transitioning',
          after: () => status.value = 'removed',
          cancel: () => status.value = 'rendered',
          active: (...args) => {
            const done = args[args.length - 1]
            done()
          }
        },
        transitionWithEffects = toTransitionWithEffects(
          element,
          {
            appear: appearAndEnterEffects,
            enter: appearAndEnterEffects,
            leave: {
              none: leaveJsEffects,
              js: leaveJsEffects,
              css: {
                start: () => status.value = 'transitioning',
                end: () => status.value = 'removed',
                cancel: () => status.value = 'rendered',
              }
            }
          },
          showOptions,
        )

  show(
    element,
    condition,
    {
      ...showOptions,
      transition: transitionWithEffects,
    }
  )

  return {
    status: computed(() => status.value),
    render,
    remove,
    toggle,
    is: {
      rendered: () => status.value === 'rendered' || status.value === 'transitioning',
      removed: () => status.value === 'removed',
      transitioning: () => status.value === 'transitioning',
    }
  }
}
