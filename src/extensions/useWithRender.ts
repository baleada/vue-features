import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { show } from '../affordances'
import type { ShowOptions } from '../affordances'
import { narrowElement, toTransitionWithEffects } from '../extracted'
import type { ExtendableElement, TransitionEffects } from '../extracted'

// TODO: test custom duration class

export type WithRender = {
  render: () => void,
  remove: () => void,
  toggle: () => boolean,
  status: ComputedRef<WithRenderStatus>,
  is: {
    rendered: () => boolean,
    removed: () => boolean,
    rendering: () => boolean,
  }
}

type WithRenderStatus = 'rendering' | 'rendered' | 'removed'

export type UseWithRenderOptions = {
  initialRenders?: boolean,
  show?: ShowOptions<Ref<HTMLElement>>
}

const defaultOptions: UseWithRenderOptions = {
  initialRenders: true,
  show: {},
}

export function useWithRender (
  extendable: ExtendableElement,
  options: UseWithRenderOptions = {},
): WithRender {
  const { initialRenders, show: showOptions } = { ...defaultOptions, ...options }

  const element = narrowElement(extendable),
        condition = ref(initialRenders),
        status = ref<WithRender['status']['value']>(initialRenders ? 'rendered' : 'removed'),
        render: WithRender['render'] = () => {
          status.value = 'rendering' // Necessary to make the userland `v-if` render the element so that `show` can take over
          condition.value = true
        },
        remove: WithRender['remove'] = () => {
          condition.value = false
        },
        toggle: WithRender['toggle'] = () => condition.value
          ? (remove(), false)
          : (render(), true),
        appearAndEnterJsEffects: TransitionEffects<typeof element>['appear']['js'] = {
          before: () => status.value = 'rendering',
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
            start: () => status.value = 'rendering',
            end: () => status.value = 'rendered',
            cancel: () => status.value = 'removed',
          },
        },
        leaveJsEffects: TransitionEffects<typeof element>['leave']['js'] = {
          before: () => status.value = 'rendering',
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
                start: () => status.value = 'rendering',
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
      rendered: () => status.value === 'rendered' || status.value === 'rendering',
      removed: () => status.value === 'removed',
      rendering: () => status.value === 'rendering',
    },
  }
}
