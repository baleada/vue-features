import { ref, computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { show } from '../affordances'
import type { ShowOptions } from '../affordances'
import { narrowElement, toTransitionWithEffects } from '../extracted'
import type { ExtendableElement, TransitionEffects } from '../extracted'

// TODO: test custom duration class

export type Rendering = {
  render: () => void,
  remove: () => void,
  toggle: () => boolean,
  status: ComputedRef<RenderingStatus>,
  is: {
    rendered: () => boolean,
    removed: () => boolean,
    rendering: () => boolean,
    removing: () => boolean,
  }
}

type RenderingStatus = 'rendering' | 'rendered' | 'removing' | 'removed'

export type UseRenderingOptions = {
  initialRenders?: boolean,
  show?: ShowOptions<Ref<HTMLElement>>
}

const defaultOptions: UseRenderingOptions = {
  initialRenders: true,
  show: {},
}

export function useRendering (
  extendable: ExtendableElement,
  options: UseRenderingOptions = {},
): Rendering {
  const { initialRenders, show: showOptions } = { ...defaultOptions, ...options }

  const element = narrowElement(extendable),
        condition = ref(initialRenders),
        status = ref<Rendering['status']['value']>(initialRenders ? 'rendered' : 'removed'),
        render: Rendering['render'] = () => {
          status.value = 'rendering' // Necessary to make the userland `v-if` render the element so that `show` can take over
          condition.value = true
        },
        remove: Rendering['remove'] = () => {
          condition.value = false
        },
        toggle: Rendering['toggle'] = () => condition.value
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
          before: () => status.value = 'removing',
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
                start: () => status.value = 'removing',
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
      rendered: () => status.value === 'rendered',
      removed: () => status.value === 'removed',
      rendering: () => status.value === 'rendering',
      removing: () => status.value === 'removing',
    },
  }
}
