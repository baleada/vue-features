import { ref, computed, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { bind } from '../affordances'
import { usePressing } from '../extensions'
import type { Pressing, UsePressingOptions } from '../extensions'
import { useElementApi } from '../extracted'
import type { IdentifiedElementApi } from '../extracted'

export type Button<Toggles extends boolean = false> = ButtonBase
  & (
    Toggles extends true
      ? {
        status: ComputedRef<ToggleButtonStatus>,
        toggle: () => void,
        on: () => void,
        off: () => void,
        is: {
          on: () => boolean,
          off: () => boolean,
        },
      }
      : {}
  )

type ButtonBase = {
  root: IdentifiedElementApi<HTMLButtonElement>,
  pressing: Pressing,
}

type ToggleButtonStatus = 'on' | 'off'

export type UseButtonOptions<Toggles extends boolean = false> = {
  toggles?: Toggles,
  initialStatus?: ToggleButtonStatus,
  pressing?: UsePressingOptions,
}

const defaultOptions: UseButtonOptions<false> = {
  toggles: false,
  initialStatus: 'off',
  pressing: {},
}

export function useButton<Toggles extends boolean = false> (options: UseButtonOptions<Toggles> = {}): Button<Toggles> {
  // OPTIONS
  const {
    toggles,
    initialStatus,
    pressing: pressingOptions,
  } = { ...defaultOptions, ...options } as UseButtonOptions<Toggles>


  // ELEMENTS
  const root = useElementApi<HTMLButtonElement, 'element', true>({ identified: true })

  
  // TOGGLE STATUS
  const status = ref(initialStatus),
        toggle = () => {
          status.value = status.value === 'on' ? 'off' : 'on'
        },
        toggleOn = () => {
          status.value = 'on'
        },
        toggleOff = () => {
          status.value = 'off'
        }


  // PRESSING
  const pressing = usePressing(root.element, pressingOptions)

  if (toggles) {
    watch(pressing.release, toggle)
  }


  // BASIC BINDINGS
  bind(
    root.element,
    { role: 'button' }
  )

  if (toggles) {
    bind(
      root.element,
      { ariaPressed: computed(() => `${status.value === 'on'}`) }
    )
  }


  // API
  if (toggles) {
    return {
      root,
      status: computed(() => status.value),
      toggle,
      on: toggleOn,
      off: toggleOff,
      is: {
        on: () => status.value === 'on',
        off: () => status.value === 'off',
      },
      pressing,
    } as unknown as Button<Toggles>
  }

  return {
    root,
    pressing,
  } as unknown as Button<Toggles>
}
