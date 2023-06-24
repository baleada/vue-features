import { provide } from 'vue'
import type { InjectionKey, Ref , onMounted, onBeforeUnmount, watch } from 'vue'
import {
  createMousepress,
  createTouchpress,
  createKeypress,
  createMouserelease,
  createTouchrelease,
  createKeyrelease,
} from '@baleada/logic'
import type {
  MousepressType,
  MousepressMetadata,
  TouchpressType,
  TouchpressMetadata,
  KeypressType,
  KeypressMetadata,
  MousereleaseType,
  MousereleaseMetadata,
  TouchreleaseType,
  TouchreleaseMetadata,
  KeyreleaseType,
  KeyreleaseMetadata,
} from '@baleada/logic'
import { defineRecognizeableEffect, on } from '../affordances'
import type { OnEffectConfig } from '../affordances'
import { useBody } from './useBody'

export type PressingCreateOn = (scoped: {
  watch: typeof watch,
  onMounted: typeof onMounted,
  onBeforeUnmount: typeof onBeforeUnmount
}) => typeof on<
  Ref<HTMLElement>,
  'recognizeable',
  MousepressMetadata
  | TouchpressMetadata
  | KeypressMetadata
  | MousereleaseMetadata
  | TouchreleaseMetadata
  | KeyreleaseMetadata
>

type PressingEffects = {
  recognizeable: OnEffectConfig<Ref<HTMLElement>, MousepressType, MousepressMetadata>
    | OnEffectConfig<Ref<HTMLElement>, TouchpressType, TouchpressMetadata>
    | OnEffectConfig<Ref<HTMLElement>, KeypressType, KeypressMetadata>
    | OnEffectConfig<Ref<HTMLElement>, MousereleaseType, MousereleaseMetadata>
    | OnEffectConfig<Ref<HTMLElement>, TouchreleaseType, TouchreleaseMetadata>
    | OnEffectConfig<Ref<HTMLElement>, KeyreleaseType, KeyreleaseMetadata>,
}

export const PressingInjectionKey: InjectionKey<{ createOn: PressingCreateOn }> = Symbol('Baleada Features Press State')

// TODO: allow options
// - effectScope
// - identify effectScope by options?
export function providePressingOn (element?: HTMLElement | Ref<HTMLElement>) {
  const effectsByElement = new WeakMap<HTMLElement, PressingEffects>(),
        createOn: PressingCreateOn = scoped =>
          (element, effects) => {
            scoped.onMounted(() => {
              scoped.watch(
                element,
                (current, previous) => {
                  if (current) effectsByElement.set(
                    current,
                    // @ts-expect-error
                    {
                      ...effectsByElement.get(current),
                      ...effects,
                    }
                  )
                  else effectsByElement.delete(previous)
                },
                { immediate: true }
              )
            })

            scoped.onBeforeUnmount(() => {
              if (element.value) effectsByElement.delete(element.value)
            })
          },
        narrowedElement = (() => {
          if (element) return element
          const body = useBody()
          return body.element
        })()

  for (const recognizeable of ['mousepress', 'touchpress', 'keypress'] as const) {
    const recognizeableEffects = (() => {
      switch (recognizeable) {
        case 'mousepress':
          return createMousepress()
        case 'touchpress':
          return createTouchpress()
        case 'keypress':
          return createKeypress(['space', 'enter'])
      }
    })() as ReturnType<typeof createMousepress>

    on(
      narrowedElement,
      {
        ...defineRecognizeableEffect(narrowedElement, recognizeable as 'mousepress', {
          createEffect: (...createEffectParams) => event => {
            getEffects(
              recognizeable === 'keypress' || recognizeable === 'touchpress'
                ? event.target as HTMLElement
                : [event.clientX, event.clientY]
            )
              ?.[`recognizeable${recognizeable as 'mousepress'}`]
              ?.createEffect?.(...createEffectParams)
              ?.(event)
          },
          options: {
            listenable: { recognizeable: { effects: recognizeableEffects } },
            // @ts-expect-error
            listen: recognizeable === 'touchpress' ? { passive: true } : {},
          },
        }),
      }
    )
  }

  for (const recognizeable of ['mouserelease', 'touchrelease', 'keyrelease'] as const) {
    const recognizeableEffects = (() => {
      switch (recognizeable) {
        case 'mouserelease':
          return createMouserelease()
        case 'touchrelease':
          return createTouchrelease()
        case 'keyrelease':
          return createKeyrelease(['space', 'enter'])
      }
    })() as ReturnType<typeof createMouserelease>

    on(
      narrowedElement,
      {
        ...defineRecognizeableEffect(narrowedElement, recognizeable as 'mouserelease', {
          createEffect: (...createEffectParams) => event => {
            getEffects(
              recognizeable === 'keyrelease' || recognizeable === 'touchrelease'
                ? event.target as HTMLElement
                : [event.clientX, event.clientY]
            )
              ?.[`recognizeable${recognizeable as 'mouserelease'}`]
              ?.createEffect?.(...createEffectParams)
              ?.(event)
          },
          options: {
            listenable: { recognizeable: { effects: recognizeableEffects } },
            // @ts-expect-error
            listen: recognizeable === 'touchrelease' ? { passive: true } : {},
          },
        }),
      }
    )
  }

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

  provide(PressingInjectionKey, { createOn })
}
