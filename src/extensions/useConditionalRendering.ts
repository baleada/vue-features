import { computed, nextTick, ref } from 'vue'
import type { Ref } from 'vue'
import type { ShowOptions } from '../affordances'
import { ensureElementFromExtendable, showWithEffects } from "../extracted"
import type { Extendable } from "../extracted"

export type ConditionalRendering = {
  renders: Ref<boolean>,
  render: () => any,
  remove: () => any,
  toggle: () => any,
  status: Ref<ConditionalRenderingStatus>,
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
        status: ConditionalRendering['status'] = ref(condition.value ? 'rendered' : 'removed'),
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
        appearAndEnterJsEffects: Parameters<typeof showWithEffects<Ref<HTMLElement>>>[2]['appear']['js'] = {
          before: () => status.value = 'transitioning',
          after: () => status.value = 'rendered',
          cancel: () => status.value = 'removed',
        },
        appearAndEnterEffects: Parameters<typeof showWithEffects<Ref<HTMLElement>>>[2]['appear'] = {
          none: appearAndEnterJsEffects,
          js: appearAndEnterJsEffects,
          css: {
            start: () => status.value = 'transitioning',
            end: () => status.value = 'rendered',
            cancel: () => status.value = 'removed',
          }
        },
        leaveJsEffects: Parameters<typeof showWithEffects<Ref<HTMLElement>>>[2]['leave']['js'] = {
          before: () => status.value = 'transitioning',
          after: () => status.value = 'removed',
          cancel: () => status.value = 'rendered',
        }

  showWithEffects(
    element,
    condition,
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
    showOptions
  )

  return {
    renders: computed(() => status.value !== 'removed'),
    status: computed(() => status.value),
    render,
    remove,
    toggle,
    is: {
      rendered: () => status.value === 'rendered',
      removed: () => status.value === 'removed',
      transitioning: () => status.value === 'transitioning',
    }
  }
}
