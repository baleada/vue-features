import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { touches } from '@baleada/recognizeable-effects'
import type { TouchesTypes, TouchesMetadata } from '@baleada/recognizeable-effects'
import { bind, on } from '../affordances'
import { useElementApi } from '../extracted'
import type { SingleIdentifiedElementApi } from '../extracted'

export type Button<Toggles extends boolean> = {
  root: SingleIdentifiedElementApi<HTMLButtonElement>,
} & (
  Toggles extends true
    ? {
      status: ComputedRef<ToggleButtonStatus>,
      is: {
        on: () => boolean,
        off: () => boolean,
      }
    }
    : Record<never, never>
)

type ToggleButtonStatus = 'on' | 'off'

export type UseButtonOptions<Toggles extends boolean> = {
  toggles?: Toggles,
} & (
  Toggles extends true ? { initialStatus?: ToggleButtonStatus } : Record<never, never>
)

const defaultOptions: UseButtonOptions<false> = { toggles: false }
const defaultTogglesOptions: UseButtonOptions<true> = { initialStatus: 'off' }

export function useButton<Toggles extends boolean> (options: UseButtonOptions<Toggles> = {}): Button<Toggles> {
  // OPTIONS
  const {
    toggles,
  } = { ...defaultOptions, ...options }

  // ELEMENTS
  const root = useElementApi<HTMLButtonElement, false, true>({ identified: true })


  // BASIC BINDINGS
  bind({
    element: root.element,
    values: {
      role: 'button',
    }
  })


  // TOGGLES
  if (toggles) {
    // OPTIONS
    const {
      initialStatus,
    } = { ...defaultTogglesOptions, ...options }


    // STATUS
    const status = ref(initialStatus)

    on<'mousedown' | '+space' | '+enter' | TouchesTypes, TouchesMetadata>({
      element: root.element,
      effects: defineEffect => [
        ...(['mousedown', 'space', 'enter'] as 'mousedown'[]).map(name => defineEffect(
          name,
          () => {
            status.value = status.value === 'on' ? 'off' : 'on'
          }
        )),
        defineEffect(
          'recognizeable' as TouchesTypes,
          {
            createEffect: () => () => {
              status.value = status.value === 'on' ? 'off' : 'on'
            },
            options: {
              listenable: {
                recognizeable: {
                  effects: touches()
                }
              },
            }
          }
        ),
      ]
    })


    // BASIC BINDINGS
    bind({
      element: root.element,
      values: {
        ariaPressed: computed(() => `${status.value === 'on'}`),
      }
    })


    // API
    return {
      root,
      status: computed(() => status.value),
      is: {
        on: () => status.value === 'on',
        off: () => status.value === 'off',
      }
    } as Button<Toggles>
  }


  // API
  return { root } as Button<Toggles>
}
