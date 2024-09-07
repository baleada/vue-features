import { provide } from 'vue'
import type { InjectionKey, Ref , onMounted, onScopeDispose, watch } from 'vue'
import { pipe as chain } from 'lazy-collections'
import {
  createMousepress,
  createTouchpress,
  createKeypress,
} from '@baleada/logic'
import type {
  MousepressType,
  MousepressMetadata,
  TouchpressType,
  TouchpressMetadata,
  KeypressType,
  KeypressMetadata,
  MousepressOptions,
  TouchpressOptions,
  KeypressOptions,
  MousepressHookApi,
  TouchpressHookApi,
  KeypressHookApi,
} from '@baleada/logic'
import { defineRecognizeableEffect, on } from '../affordances'
import type { OnEffectConfig } from '../affordances'
import type { UsePressOptions } from '../extensions'
import { useBody } from './useBody'
import type { SupportedElement } from './toRenderedKind'
import { createGetDelegateds, type Delegated } from './createGetDelegateds'

export type PressCreateOn = (scoped: {
  watch: typeof watch,
  onMounted: typeof onMounted,
  onScopeDispose: typeof onScopeDispose,
  options: UsePressOptions,
}) => typeof on<
  Ref<SupportedElement>,
  'recognizeable',
  (
    | MousepressMetadata
    | TouchpressMetadata
    | KeypressMetadata
  )
>

type PressEffects = {
  recognizeable: (
    | OnEffectConfig<Ref<SupportedElement>, MousepressType, MousepressMetadata>
    | OnEffectConfig<Ref<SupportedElement>, TouchpressType, TouchpressMetadata>
    | OnEffectConfig<Ref<SupportedElement>, KeypressType, KeypressMetadata>
  ),
}

export const PressInjectionKey: InjectionKey<{ createOn: PressCreateOn }> = Symbol('Press')

export const supportedMouseOptions: (keyof Pick<MousepressOptions, 'onDown' | 'onMove' | 'onOut' | 'onUp'>)[] = ['onDown', 'onMove', 'onOut', 'onUp']
export const supportedTouchOptions: (keyof Pick<TouchpressOptions, 'onStart' | 'onMove' | 'onCancel' | 'onEnd'>)[] = ['onStart', 'onMove', 'onCancel', 'onEnd']
export const supportedKeyboardOptions: (keyof Pick<KeypressOptions, 'onDown' | 'onUp'>)[] = ['onDown', 'onUp']

// TODO:
// - scoped onRender instead of onMounted?
export function delegatePress (element?: SupportedElement | Ref<SupportedElement>) {
  const delegatedByElement = new WeakMap<SupportedElement, Delegated<PressEffects, UsePressOptions>>(),
        createOn: PressCreateOn = scoped => (
          (element, effects) => {
            scoped.onMounted(() => {
              scoped.watch(
                element,
                (current, previous) => {
                  if (!current) {
                    delegatedByElement.delete(previous)
                    return
                  }

                  const mapped = delegatedByElement.get(current)

                  delegatedByElement.set(
                    current,
                    {
                      ...mapped,
                      effects: {
                        ...mapped?.effects,
                        ...effects ,
                      } as unknown as PressEffects,
                      options: scoped.options,
                    }
                  )
                },
                { immediate: true }
              )
            })

            scoped.onScopeDispose(() => {
              if (element.value) delegatedByElement.delete(element.value)
            })

            return listenablesByType
          }
        ),
        narrowedElement = element || useBody().element,
        getDelegateds = createGetDelegateds(delegatedByElement),
        createWithDelegatedOption = <FactoryOptions extends MousepressOptions | TouchpressOptions | KeypressOptions>(
          { pressKind, option, toElementOrDomCoordinates }: {
            pressKind: (
              Required<FactoryOptions> extends Required<MousepressOptions> ? 'mouse' :
              Required<FactoryOptions> extends Required<TouchpressOptions> ? 'touch' :
              Required<FactoryOptions> extends Required<KeypressOptions> ? 'keyboard' :
              never
            ),
            option: (
              Required<FactoryOptions> extends Required<MousepressOptions> ? typeof supportedMouseOptions[number] :
              Required<FactoryOptions> extends Required<TouchpressOptions> ? typeof supportedTouchOptions[number] :
              Required<FactoryOptions> extends Required<KeypressOptions> ? typeof supportedKeyboardOptions[number] :
              never
            ),
            toElementOrDomCoordinates: (
              // @ts-expect-error
              api: Parameters<FactoryOptions[typeof option]>[0]
            ) => Parameters<typeof getDelegateds>[0]
          }
        ) => api => chain(
          () => toElementOrDomCoordinates(api),
          getDelegateds,
          delegateds => {
            for (const delegated of delegateds) {
              delegated?.options[pressKind]?.[option]?.(api)
            }
          },
        )()

  // LISTENABLES BY TYPE
  let listenablesByType = {} as ReturnType<ReturnType<PressCreateOn>>
  for (const recognizeable of ['mousepress', 'touchpress', 'keypress'] as const) {
    const recognizeableEffects = (() => {
      switch (recognizeable) {
        case 'mousepress':
          return createMousepress({
            onDown: createWithDelegatedOption<MousepressOptions>({ pressKind: 'mouse', option: 'onDown', toElementOrDomCoordinates: toEndPoint }),
            onMove: createWithDelegatedOption<MousepressOptions>({ pressKind: 'mouse', option: 'onMove', toElementOrDomCoordinates: toEndPoint }),
            onOut: createWithDelegatedOption<MousepressOptions>({ pressKind: 'mouse', option: 'onOut', toElementOrDomCoordinates: toEndPoint }),
            onUp: createWithDelegatedOption<MousepressOptions>({ pressKind: 'mouse', option: 'onUp', toElementOrDomCoordinates: toEndPoint }),
          })
        case 'touchpress':
          return createTouchpress({
            onStart: createWithDelegatedOption<TouchpressOptions>({ pressKind: 'touch', option: 'onStart', toElementOrDomCoordinates: toEndPoint }),
            onMove: createWithDelegatedOption<TouchpressOptions>({ pressKind: 'touch', option: 'onMove', toElementOrDomCoordinates: toEndPoint }),
            onCancel: createWithDelegatedOption<TouchpressOptions>({ pressKind: 'touch', option: 'onCancel', toElementOrDomCoordinates: toEndPoint }),
            onEnd: createWithDelegatedOption<TouchpressOptions>({ pressKind: 'touch', option: 'onEnd', toElementOrDomCoordinates: toEndPoint }),
          })
        case 'keypress':
          return createKeypress(['space', 'enter'], {
            onDown: createWithDelegatedOption<KeypressOptions>({ pressKind: 'keyboard', option: 'onDown', toElementOrDomCoordinates: toTarget }),
            onUp: createWithDelegatedOption<KeypressOptions>({ pressKind: 'keyboard', option: 'onUp', toElementOrDomCoordinates: toTarget }),
          })
      }
    })() as ReturnType<typeof createMousepress>

    const newListenablesByType = on(
      narrowedElement,
      {
        ...defineRecognizeableEffect(narrowedElement, recognizeable as 'mousepress', {
          createEffect: ({ listenable, ...api }) => event => chain(
            () => recognizeable === 'keypress'
              ? event.target as SupportedElement
              : listenable.recognizeable.metadata.points.end,
            getDelegateds,
            (delegateds: Delegated<PressEffects, UsePressOptions>[]) => {
              for (const delegated of delegateds) {
                delegated
                  ?.effects
                  [`recognizeable_${recognizeable}`]
                  .createEffect({ listenable, ...api })(event)
              }
            }
          )(),
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

  provide(PressInjectionKey, { createOn })
}

function toEndPoint (api: MousepressHookApi | TouchpressHookApi) {
  return api.metadata.points?.end || { x: -1, y: -1 }
}

function toTarget (api: KeypressHookApi) {
  return api.sequence.at(-1).target as SupportedElement
}
