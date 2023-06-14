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
  const toggled = ref(initialStatus),
        toggle = () => {
          toggled.value = toggled.value === 'on' ? 'off' : 'on'
        },
        toggleOn = () => {
          toggled.value = 'on'
        },
        toggleOff = () => {
          toggled.value = 'off'
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
      { ariaPressed: computed(() => `${toggled.value === 'on'}`) }
    )
  }


  // API
  if (toggles) {
    return {
      root,
      status: pressing.status,
      toggled: computed(() => toggled.value),
      press: pressing.press,
      release: pressing.release,
      toggle,
      on: toggleOn,
      off: toggleOff,
      is: {
        on: () => toggled.value === 'on',
        off: () => toggled.value === 'off',
        ...pressing.is,
      },
      getStatuses: () => [
        pressing.status.value,
        toggled.value
      ],
    } as unknown as Button<Toggles>
  }

  return {
    root,
    status: pressing.status,
    press: pressing.press,
    release: pressing.release,
    is: pressing.is,
    getStatuses: () => [pressing.status.value],
  } as unknown as Button<Toggles>
}
