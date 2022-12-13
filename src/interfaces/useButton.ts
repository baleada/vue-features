import { ref, computed, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { bind } from '../affordances'
import { usePressState } from '../extensions'
import type { PressState, UsePressStateOptions } from '../extensions'
import { useElementApi } from '../extracted'
import type { IdentifiedElementApi } from '../extracted'

export type Button<Toggles extends boolean = false> = ButtonBase
  & (
    Toggles extends true
      ? {
        pressStatus: PressState['status'],
        toggleStatus: ComputedRef<ToggleButtonStatus>,
        toggle: () => void,
        on: () => void,
        off: () => void,
        is: {
          on: () => boolean,
          off: () => boolean,
        } & PressState['is'],
        getStatuses: () => [
          PressState['status']['value'],
          'on' | 'off',
        ],
      }
      : {
        pressStatus: PressState['status'],
        is: PressState['is'],
        getStatuses: () => [
          PressState['status']['value'],
        ],
      }
  )

type ButtonBase = {
  root: IdentifiedElementApi<HTMLButtonElement>,
  event: PressState['event']['value'],
}

type ToggleButtonStatus = 'on' | 'off'

export type UseButtonOptions<Toggles extends boolean = false> = {
  toggles?: Toggles,
  initialStatus?: ToggleButtonStatus,
  pressState?: UsePressStateOptions,
}

const defaultOptions: UseButtonOptions<false> = {
  toggles: false,
  initialStatus: 'off',
  pressState: {},
}

export function useButton<Toggles extends boolean = false> (options: UseButtonOptions<Toggles> = {}): Button<Toggles> {
  // OPTIONS
  const {
    toggles,
    initialStatus,
    pressState: pressStateOptions,
  } = { ...defaultOptions, ...options } as UseButtonOptions<Toggles>


  // ELEMENTS
  const root = useElementApi<HTMLButtonElement, 'element', true>({ identified: true })

  
  // TOGGLE STATUS
  const toggleStatus = ref(initialStatus),
        toggle = () => {
          toggleStatus.value = toggleStatus.value === 'on' ? 'off' : 'on'
        },
        toggleOn = () => {
          toggleStatus.value = 'on'
        },
        toggleOff = () => {
          toggleStatus.value = 'off'
        }


  // PRESS STATE
  const pressState = usePressState(root.element, pressStateOptions)

  if (toggles) {
    watch(
      pressState.status,
      () => {
        if (pressState.status.value === 'released') toggle()
      }
    )
  }


  // BASIC BINDINGS
  bind(
    root.element,
    { role: 'button' }
  )

  if (toggles) {
    bind(
      root.element,
      { ariaPressed: computed(() => `${toggleStatus.value === 'on'}`) }
    )
  }


  // API
  if (toggles) {
    return {
      root,
      event: pressState.event,
      pressStatus: pressState.status,
      toggleStatus: computed(() => toggleStatus.value),
      toggle,
      on: toggleOn,
      off: toggleOff,
      is: {
        on: () => toggleStatus.value === 'on',
        off: () => toggleStatus.value === 'off',
        ...pressState.is,
      },
      getStatuses: () => [
        pressState.status.value,
        toggleStatus.value
      ],
    } as unknown as Button<Toggles>
  }

  return {
    root,
    event: pressState.event,
    pressStatus: pressState.status,
    is: pressState.is,
    getStatuses: () => [pressState.status.value],
  } as unknown as Button<Toggles>
}
