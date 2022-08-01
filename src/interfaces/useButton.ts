import { ref, computed, watch, onMounted, onBeforeUnmount, inject } from 'vue'
import type { ComputedRef } from 'vue'
import { touches } from '@baleada/recognizeable-effects'
import type { TouchesTypes, TouchesMetadata } from '@baleada/recognizeable-effects'
import { bind, on as _on, defineRecognizeableEffect } from '../affordances'
import { useElementApi, ButtonInjectionKey } from '../extracted'
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
      : Record<never, never>
  )

type ButtonBase = {
  root: IdentifiedElementApi<HTMLButtonElement>,
  event: ComputedRef<MouseEvent | TouchEvent | KeyboardEvent>,
}

type ToggleButtonStatus = 'on' | 'off'

export type UseButtonOptions<Toggles extends boolean = false> = {
  toggles?: Toggles,
  initialStatus?: ToggleButtonStatus,
}

const defaultOptions: UseButtonOptions<false> = {
  toggles: false,
  initialStatus: 'off'
}

export function useButton<Toggles extends boolean = false> (options: UseButtonOptions<Toggles> = {}): Button<Toggles> {
  const on = inject(ButtonInjectionKey)?.createOn?.(watch, onMounted, onBeforeUnmount) || _on

  // OPTIONS
  const {
    toggles,
    initialStatus,
  } = { ...defaultOptions, ...options } as UseButtonOptions<Toggles>


  // ELEMENTS
  const root = useElementApi<HTMLButtonElement, 'element', true>({ identified: true })


  // STATUS & CLICKED
  const status = ref(initialStatus),
        _event = ref<Button['event']['value']>({} as Button['event']['value']),
        toggle = () => {
          status.value = status.value === 'on' ? 'off' : 'on'
        },
        toggleOn = () => {
          status.value = 'on'
        },
        toggleOff = () => {
          status.value = 'off'
        }

  on(
    root.element,
    // @ts-expect-error
    {
      mousedown: toggles
        ? event => {
          toggle()
          _event.value = event
        }
        : event => {
          _event.value = event
        },
      keydown: toggles
        ? (event, { is }) => {
          if (is('enter') || is('space')) {
            toggle()
            _event.value = event
          }
        }
        : (event, { is }) => {
          if (is('enter') || is('space')) {
            _event.value = event
          }
        },
      ...defineRecognizeableEffect<typeof root.element, TouchesTypes, TouchesMetadata>({
        createEffect: toggles
          ? () => event => {
            toggle()
            _event.value = event
          }
          : () => event => {
            _event.value = event
          },
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
      event: computed(() => _event.value),
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
    event: computed(() => _event.value),
  } as unknown as Button<Toggles>
}
