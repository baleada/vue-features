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
import type { SupportedElement } from './toRenderedKind'

export type PressCreateOn = (scoped: {
  watch: typeof watch,
  onMounted: typeof onMounted,
  onScopeDispose: typeof onScopeDispose
}) => typeof on<
  Ref<SupportedElement>,
  'recognizeable',
  MousepressMetadata
  | TouchpressMetadata
  | KeypressMetadata
  | MousereleaseMetadata
  | TouchreleaseMetadata
  | KeyreleaseMetadata
>

type PressEffects = {
  recognizeable: OnEffectConfig<Ref<SupportedElement>, MousepressType, MousepressMetadata>
    | OnEffectConfig<Ref<SupportedElement>, TouchpressType, TouchpressMetadata>
    | OnEffectConfig<Ref<SupportedElement>, KeypressType, KeypressMetadata>
    | OnEffectConfig<Ref<SupportedElement>, MousereleaseType, MousereleaseMetadata>
    | OnEffectConfig<Ref<SupportedElement>, TouchreleaseType, TouchreleaseMetadata>
    | OnEffectConfig<Ref<SupportedElement>, KeyreleaseType, KeyreleaseMetadata>,
}

export const PressInjectionKey: InjectionKey<{ createOn: PressCreateOn }> = Symbol('Press')

// TODO: allow options
// - effectScope
// - identify effectScope by options?
// - scoped onRender instead of onMounted I think
export function delegatePress (element?: SupportedElement | Ref<SupportedElement>) {
  const effectsByElement = new WeakMap<SupportedElement, PressEffects>(),
        createOn: PressCreateOn = scoped => (
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

  let listenablesByType = {} as ReturnType<ReturnType<PressCreateOn>>
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
            const eventTargetOrCoordinates = recognizeable === 'keypress'
              ? event.target as SupportedElement
              : recognizeable === 'touchpress'
                ? {
                  x: (event as unknown as TouchEvent).touches[0].clientX,
                  y: (event as unknown as TouchEvent).touches[0].clientY,
                }
                : { x: event.clientX, y: event.clientY }

            getEffects(eventTargetOrCoordinates)
              ?.[`recognizeable_${recognizeable as 'mousepress'}`]
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
            const eventTargetOrCoordinates = recognizeable === 'keyrelease'
              ? event.target as SupportedElement
              : recognizeable === 'touchrelease'
                ? {
                  x: (event as unknown as TouchEvent).changedTouches[0].clientX,
                  y: (event as unknown as TouchEvent).changedTouches[0].clientY,
                }
                : { x: event.clientX, y: event.clientY }

            getEffects(eventTargetOrCoordinates)
              ?.[`recognizeable_${recognizeable as 'mouserelease'}`]
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

  const getEffects = (eventTargetOrCoordinates: SupportedElement | { x: number, y: number }) => {
    if (
      eventTargetOrCoordinates instanceof HTMLElement
      || eventTargetOrCoordinates instanceof SVGElement
    ) {
      return effectsByElement.get(eventTargetOrCoordinates)
    }

    const { x, y } = eventTargetOrCoordinates

    for (const element of document.elementsFromPoint(x, y)) {
      const effects = effectsByElement.get(element as SupportedElement)
      if (effects) return effects
    }
  }

  provide(PressInjectionKey, { createOn })
}
