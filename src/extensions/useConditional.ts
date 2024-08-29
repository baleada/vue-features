import { ref, computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { show } from '../affordances'
import type { ShowOptions } from '../affordances'
import { narrowElement, toTransitionWithEffects } from '../extracted'
import type { ExtendableElement, SupportedElement, TransitionEffects } from '../extracted'

export type Conditional = {
  render: () => void,
  remove: () => void,
  toggle: () => boolean,
  status: ComputedRef<ConditionalStatus>,
  is: {
    rendered: () => boolean,
    removed: () => boolean,
    conditional: () => boolean,
    removing: () => boolean,
  }
}

type ConditionalStatus = 'rendering' | 'rendered' | 'removing' | 'removed'

export type UseConditionalOptions = {
  initialRenders?: boolean,
  show?: ShowOptions<Ref<SupportedElement>>
}

const defaultOptions: UseConditionalOptions = {
  initialRenders: true,
  show: {},
}

export function useConditional (
  extendable: ExtendableElement,
  options: UseConditionalOptions = {},
): Conditional {
  const { initialRenders, show: showOptions } = { ...defaultOptions, ...options }

  const element = narrowElement(extendable),
        condition = ref(initialRenders),
        status = ref<Conditional['status']['value']>(initialRenders ? 'rendered' : 'removed'),
        render: Conditional['render'] = () => {
          status.value = 'rendering' // Necessary to make the userland `v-if` render the element so that `show` can take over
          condition.value = true
        },
        remove: Conditional['remove'] = () => {
          condition.value = false
        },
        toggle: Conditional['toggle'] = () => condition.value
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
      conditional: () => status.value === 'rendering',
      removing: () => status.value === 'removing',
    },
  }
}
