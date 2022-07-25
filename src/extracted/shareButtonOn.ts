import { provide, onMounted, onBeforeUnmount, isRef, computed } from 'vue'
import type { InjectionKey, Ref } from 'vue'
import { touches } from '@baleada/recognizeable-effects'
import type { TouchesMetadata, TouchesTypes } from '@baleada/recognizeable-effects'
import type { ListenEffect } from '@baleada/logic'
import { defineRecognizeableEffect, on } from '../affordances'
import type { OnEffectConfig } from '../affordances'

export type ButtonCreateOn = (localOnMounted: typeof onMounted, localOnBeforeUnmount: typeof onBeforeUnmount) =>
  typeof on<Ref<HTMLButtonElement>, keyof ButtonEffects>

type ButtonEffects = {
  mousedown: ListenEffect<'mousedown'>,
  keydown: ListenEffect<'keydown'>,
  recognizeable: OnEffectConfig<Ref<HTMLButtonElement>, TouchesTypes, TouchesMetadata>
}

export const ButtonInjectionKey: InjectionKey<{ createOn: ButtonCreateOn }> = Symbol('Baleada Features Button')

export function shareButtonOn () {
  const effectsByElement = new WeakMap<HTMLButtonElement, ButtonEffects>(),
        createOn: ButtonCreateOn = (localOnMounted, localOnBeforeUnmount) =>
          (button, effects) => {
            localOnMounted(() => {
              // @ts-expect-error
              effectsByElement.set(button.value, effects)
              console.log('mounted')
            })

            localOnBeforeUnmount(() => {
              effectsByElement.delete(button.value)
              console.log('unmounted')
            })
          }

  on(
    document.body,
    {
      mousedown (event, api) {
        getEffects([event.clientX, event.clientY])?.mousedown?.(event, api)
      },
      keydown (event, api) {
        getEffects(event.target as HTMLButtonElement)?.keydown?.(event, api)
      },
      ...defineRecognizeableEffect<typeof document.body, TouchesTypes, TouchesMetadata>({
        createEffect: (...createEffectParams) => (event, api) => {
          getEffects([event.changedTouches[0].clientX, event.changedTouches[0].clientY])
            ?.recognizeable
            ?.createEffect?.(...createEffectParams)
            ?.(event, api)
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

  const getEffects = (eventTargetOrCoordinates: HTMLButtonElement | [x: number, y: number]) => {
    if (Array.isArray(eventTargetOrCoordinates)) {
      const [x, y] = eventTargetOrCoordinates

      for (const element of document.elementsFromPoint(x, y)) {
        const effects = effectsByElement.get(element as HTMLButtonElement)
        if (effects) return effects
      }

      return
    }

    return effectsByElement.get(eventTargetOrCoordinates)
  }

  provide(ButtonInjectionKey, { createOn })
}
