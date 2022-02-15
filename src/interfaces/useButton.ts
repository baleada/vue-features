import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { touches } from '@baleada/recognizeable-effects'
import type { TouchesTypes, TouchesMetadata } from '@baleada/recognizeable-effects'
import { bind, on } from '../affordances'
import { useElementApi } from '../extracted'
import type { SingleIdentifiedElementApi } from '../extracted'

export type Button<Toggles extends boolean = false> = ButtonBase
  & (
    Toggles extends true
      ? {
        status: ComputedRef<ToggleButtonStatus>,
        is: {
          on: () => boolean,
          off: () => boolean,
        }
      }
      : { clicked: ComputedRef<number> }
  )

type ButtonBase = {
  root: SingleIdentifiedElementApi<HTMLButtonElement>,
}

type ToggleButtonStatus = 'on' | 'off'

export type UseButtonOptions<Toggles extends boolean = false> = {
  toggles?: Toggles,
  initialStatus?: ToggleButtonStatus
}

const defaultOptions: UseButtonOptions<false> = { toggles: false, initialStatus: 'off' }

export function useButton<Toggles extends boolean = false> (options: UseButtonOptions<Toggles> = {}): Button<Toggles> {
  // OPTIONS
  const {
    toggles,
    initialStatus,
  } = { ...defaultOptions, ...options } as UseButtonOptions<Toggles>


  // ELEMENTS
  const root = useElementApi<HTMLButtonElement, false, true>({ identified: true })


  // STATUS & CLICKED
  const status = ref(initialStatus),
        clicked = ref(0)

  on<'mousedown' | '+space' | '+enter' | TouchesTypes, TouchesMetadata>(
    root.element,
    defineEffect => [
      ...(['mousedown', 'space', 'enter'] as 'mousedown'[]).map(name => defineEffect(
        name,
        toggles
          ? () => status.value = status.value === 'on' ? 'off' : 'on'
          : () => clicked.value++
      )),
      defineEffect(
        'recognizeable' as TouchesTypes,
        {
          createEffect: toggles
            ? () => () => status.value = status.value === 'on' ? 'off' : 'on'
            : () => () => clicked.value++,
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
  )


  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: 'button',
      ariaPressed: toggles ? undefined : computed(() => `${status.value === 'on'}`),
    }
  )


  // API
  if (toggles) {
    return {
      root,
      status: computed(() => status.value),
      is: {
        on: () => status.value === 'on',
        off: () => status.value === 'off',
      }
    } as unknown as Button<Toggles>
  }

  return {
    root,
    clicked: computed(() => clicked.value),
  } as unknown as Button<Toggles>
}
