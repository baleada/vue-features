import { provide } from 'vue'
import type { InjectionKey, Ref , onMounted, onScopeDispose, watch } from 'vue'
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

export type WithPressCreateOn = (scoped: {
  watch: typeof watch,
  onMounted: typeof onMounted,
  onScopeDispose: typeof onScopeDispose
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

type WithPressEffects = {
  recognizeable: OnEffectConfig<Ref<HTMLElement>, MousepressType, MousepressMetadata>
    | OnEffectConfig<Ref<HTMLElement>, TouchpressType, TouchpressMetadata>
    | OnEffectConfig<Ref<HTMLElement>, KeypressType, KeypressMetadata>
    | OnEffectConfig<Ref<HTMLElement>, MousereleaseType, MousereleaseMetadata>
    | OnEffectConfig<Ref<HTMLElement>, TouchreleaseType, TouchreleaseMetadata>
    | OnEffectConfig<Ref<HTMLElement>, KeyreleaseType, KeyreleaseMetadata>,
}

export const WithPressInjectionKey: InjectionKey<{ createOn: WithPressCreateOn }> = Symbol('WithPress')

// TODO: allow options
// - effectScope
// - identify effectScope by options?
// - scoped onRender instead of onMounted I think
export function provideWithPressOn (element?: HTMLElement | Ref<HTMLElement>) {
  const effectsByElement = new WeakMap<HTMLElement, WithPressEffects>(),
        createOn: WithPressCreateOn = scoped => (
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

            scoped.onScopeDispose(() => {
              if (element.value) effectsByElement.delete(element.value)
            })

            return listenablesByType
          }
        ),
        narrowedElement = element || useBody().element

  let listenablesByType = {} as ReturnType<ReturnType<WithPressCreateOn>>
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

    const newListenablesByType = on(
      narrowedElement,
      {
        ...defineRecognizeableEffect(narrowedElement, recognizeable as 'mousepress', {
          createEffect: (...createEffectParams) => event => {
            getEffects(
              recognizeable === 'keypress' || recognizeable === 'touchpress'
                ? event.target as HTMLElement
                : { x: event.clientX, y: event.clientY }
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

    listenablesByType = {
      ...listenablesByType,
      ...newListenablesByType,
    }
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

    const newListenablesByType = on(
      narrowedElement,
      {
        ...defineRecognizeableEffect(narrowedElement, recognizeable as 'mouserelease', {
          createEffect: (...createEffectParams) => event => {
            getEffects(
              recognizeable === 'keyrelease' || recognizeable === 'touchrelease'
                ? event.target as HTMLElement
                : { x: event.clientX, y: event.clientY }
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

    listenablesByType = {
      ...listenablesByType,
      ...newListenablesByType,
    }
  }

  const getEffects = (eventTargetOrCoordinates: HTMLElement | { x: number, y: number }) => {
    if (eventTargetOrCoordinates instanceof HTMLElement) {
      return effectsByElement.get(eventTargetOrCoordinates)
    }

    const { x, y } = eventTargetOrCoordinates

    for (const element of document.elementsFromPoint(x, y)) {
      const effects = effectsByElement.get(element as HTMLElement)
      if (effects) return effects
    }
  }

  provide(WithPressInjectionKey, { createOn })
}
