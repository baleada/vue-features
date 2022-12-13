import { provide, onMounted, onBeforeUnmount, watch } from 'vue'
import type { InjectionKey, Ref } from 'vue'
import { mousepress } from '@baleada/recognizeable-effects'
import type { MousepressMetadata, MousepressTypes } from '@baleada/recognizeable-effects'
import type { ListenEffect } from '@baleada/logic'
import { defineRecognizeableEffect, on } from '../affordances'
import type { OnEffectConfig } from '../affordances'
import { useBody } from './useBody'

export type PressStateCreateOn = (localWatch: typeof watch, localOnMounted: typeof onMounted, localOnBeforeUnmount: typeof onBeforeUnmount) =>
  typeof on<Ref<HTMLElement>, keyof PressStateEffects>

type PressStateEffects = {
  recognizeable_mousepress: OnEffectConfig<Ref<HTMLElement>, MousepressTypes, MousepressMetadata>,
  // keydown: ListenEffect<'keydown'>,
  // recognizeable: OnEffectConfig<Ref<HTMLElement>, TouchesTypes, TouchesMetadata>
}

export const PressStateInjectionKey: InjectionKey<{ createOn: PressStateCreateOn }> = Symbol('Baleada Features PressState')

export function sharePressStateOn (element?: HTMLElement | Ref<HTMLElement>) {
  const effectsByElement = new WeakMap<HTMLElement, PressStateEffects>(),
        createOn: PressStateCreateOn = (localWatch, localOnMounted, localOnBeforeUnmount) =>
          (button, effects) => {
            localOnMounted(() => {
              localWatch(
                button,
                () => {
                  // @ts-expect-error
                  if (button.value) effectsByElement.set(button.value, effects)
                  else effectsByElement.delete(button.value)
                },
                { immediate: true }
              )
            })

            localOnBeforeUnmount(() => {
              if (button.value) effectsByElement.delete(button.value)
            })
          },
        ensuredElement = (() => {
          if (element) return element
          const body = useBody()
          return body.element
        })() 

  // on(
  //   ensuredElement,
  //   {
  //     ...defineRecognizeableEffect(ensuredElement, 'mousepress', {
  //       createEffect: (...createEffectParams) => (event, api) => {
  //         getEffects([event.clientX, event.clientY])
  //           ?.recognizeable_mousepress
  //           ?.createEffect?.(...createEffectParams)
  //           ?.(event, api)
  //       },
  //       options: { listenable: { recognizeable: { effects: mousepress({
  //         onUp: api => {
  //           const event = api.sequence.at(-1)

  //           getEffects([event.clientX, event.clientY])
  //             ?.recognizeable_mousepress
  //             ?.options?.listenable?.recognizeable?.effects?.mouseup(event)
  //         }
  //       }) } } },
  //     }
  //   }
  // )

  //     mousedown (event, api) {
  //       getEffects([event.clientX, event.clientY])?.mousedown?.(event, api)
  //     },
  //     keydown (event, api) {
  //       getEffects(event.target as HTMLElement)?.keydown?.(event, api)
  //     },
  //     ...defineRecognizeableEffect<typeof document.body, TouchesTypes, TouchesMetadata>({
  //       createEffect: (...createEffectParams) => (event, api) => {
  //         getEffects([event.changedTouches[0].clientX, event.changedTouches[0].clientY])
  //           ?.recognizeable
  //           ?.createEffect?.(...createEffectParams)
  //           ?.(event, api)
  //       },
  //       options: {
  //         listenable: {
  //           recognizeable: {
  //             effects: touches()
  //           }
  //         },
  //       }
  //     })
  //   }
  // )

  const getEffects = (eventTargetOrCoordinates: HTMLElement | [x: number, y: number]) => {
    if (Array.isArray(eventTargetOrCoordinates)) {
      const [x, y] = eventTargetOrCoordinates

      for (const element of document.elementsFromPoint(x, y)) {
        const effects = effectsByElement.get(element as HTMLElement)
        if (effects) return effects
      }

      return
    }

    return effectsByElement.get(eventTargetOrCoordinates)
  }

  provide(PressStateInjectionKey, { createOn })
}
