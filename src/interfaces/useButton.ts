import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { touches } from '@baleada/recognizeable-effects'
import type { TouchesTypes, TouchesMetadata } from '@baleada/recognizeable-effects'
import { bind, on, defineRecognizeableEffect } from '../affordances'
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
        }
      }
      : {
        clicked: ComputedRef<number>,
        click: () => void,
      }
  )

type ButtonBase = {
  root: IdentifiedElementApi<HTMLButtonElement>,
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
  const root = useElementApi<HTMLButtonElement, 'element', true>({ identified: true })


  // STATUS & CLICKED
  const status = ref(initialStatus),
        clicked = ref(0),
        toggle = () => {
          status.value = status.value === 'on' ? 'off' : 'on'
        },
        toggleOn = () => {
          status.value = 'on'
        },
        toggleOff = () => {
          status.value = 'off'
        },
        click = () => {
          clicked.value++
        }

  on(
    root.element,
    {
      mousedown: toggles ? toggle : click,
      keydown: toggles
        ? (event, { is }) => {
          if (is('enter') || is('space')) toggle()
        }
        : (event, { is }) => {
          if (is('enter') || is('space')) click()
        },
      ...defineRecognizeableEffect<typeof root.element, TouchesTypes, TouchesMetadata>({
        createEffect: toggles
          ? () => toggle
          : () => click,
        options: {
          listenable: {
            recognizeable: {
              effects: touches()
            }
          },
        }
      })
    }
  )


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
      }
    } as unknown as Button<Toggles>
  }

  return {
    root,
    clicked: computed(() => clicked.value),
    click,
  } as unknown as Button<Toggles>
}
