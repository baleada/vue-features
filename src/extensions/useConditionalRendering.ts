import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { show } from '../affordances'
import type { ShowOptions } from '../affordances'
import { narrowElement, toTransitionWithEffects } from '../extracted'
import type { ExtendableElement, TransitionEffects } from '../extracted'

// TODO: test custom duration class

export type ConditionalRendering = {
  render: () => void,
  remove: () => void,
  toggle: () => boolean,
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
  extendable: ExtendableElement,
  options: UseConditionalRenderingOptions = {},
): ConditionalRendering {
  const { initialRenders, show: showOptions } = { ...defaultOptions, ...options }

  const element = narrowElement(extendable),
        condition = ref(initialRenders),
        status = ref<ConditionalRendering['status']['value']>(initialRenders ? 'rendered' : 'removed'),
        render: ConditionalRendering['render'] = () => {
          status.value = 'transitioning' // Necessary to make the userland `v-if` render the element so that `show` can take over
          condition.value = true
        },
        remove: ConditionalRendering['remove'] = () => {
          condition.value = false
        },
        toggle: ConditionalRendering['toggle'] = () => condition.value
          ? (remove(), false)
          : (render(), true),
        appearAndEnterJsEffects: TransitionEffects<typeof element>['appear']['js'] = {
          before: () => status.value = 'transitioning',
          after: () => status.value = 'rendered',
          cancel: () => status.value = 'removed',
          active: (...args) => {
            const done = args[args.length - 1]
            done()
          },
        },
        appearAndEnterEffects: TransitionEffects<typeof element>['appear'] = {
          none: appearAndEnterJsEffects,
          js: appearAndEnterJsEffects,
          css: {
            start: () => status.value = 'transitioning',
            end: () => status.value = 'rendered',
            cancel: () => status.value = 'removed',
          },
        },
        leaveJsEffects: TransitionEffects<typeof element>['leave']['js'] = {
          before: () => status.value = 'transitioning',
          after: () => status.value = 'removed',
          cancel: () => status.value = 'rendered',
          active: (...args) => {
            const done = args[args.length - 1]
            done()
          },
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
              },
            },
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
    },
  }
}
