import {
  provide,
  ref,
  type InjectionKey,
  type Ref,
  type onMounted,
  type onScopeDispose,
  type watch,
} from 'vue'
import {
  pipe,
  every,
  findIndex,
  find,
  at,
} from 'lazy-collections'
import {
  createPointerpress,
  createKeypress,
  type PointerpressType,
  type PointerpressMetadata,
  type KeypressType,
  type KeypressMetadata,
  type PointerpressOptions,
  type KeypressOptions,
  type PointerpressHookApi,
  type KeypressHookApi,
  createSlice,
} from '@baleada/logic'
import {
  defineRecognizeableEffect,
  on,
  type OnEffectConfig,
} from '../affordances'
import {
  type UsePressOptions,
  type PressStatus,
} from '../extensions'
import { useBody } from './useBody'
import { type SupportedElement } from './toRenderedKind'
import {
  createToDelegatedByElementEntries,
  type Delegated,
  type DelegatedByElementEntry,
} from './createToDelegatedByElementEntries'

export type PressCreateOn = (scoped: {
  watch: typeof watch,
  onMounted: typeof onMounted,
  onScopeDispose: typeof onScopeDispose,
  options: UsePressOptions,
}) => typeof on<
  Ref<SupportedElement>,
  'recognizeable',
  PointerpressMetadata | KeypressMetadata
>

type PressEffects = {
  recognizeable: (
    | OnEffectConfig<Ref<SupportedElement>, PointerpressType, PointerpressMetadata>
    | OnEffectConfig<Ref<SupportedElement>, KeypressType, KeypressMetadata>
  ),
}

export const PressInjectionKey: InjectionKey<PressInjection> = Symbol('Press')

type PressInjection = { createOn: PressCreateOn, getStatus: () => PressStatus }

export const supportedPointerOptions: (keyof Pick<PointerpressOptions, 'onDown' | 'onMove' | 'onOut' | 'onUp'>)[] = ['onDown', 'onMove', 'onOut', 'onUp']
export const supportedKeyboardOptions: (keyof Pick<KeypressOptions, 'onDown' | 'onUp'>)[] = ['onDown', 'onUp']

export const defaultPressInjection: PressInjection = {
  createOn: () => on,
  getStatus: () => 'released',
}

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
                    pressableElements.delete(previous)
                    deniedElements.delete(previous)
                    return
                  }

                  const mapped = delegatedByElement.get(current)

                  delegatedByElement.set(
                    current,
                    {
                      ...mapped,
                      effects: {
                        ...mapped?.effects,
                        ...effects,
                      } as unknown as PressEffects,
                      options: scoped.options,
                    }
                  )
                },
                { immediate: true, flush: 'post' }
              )
            })

            scoped.onScopeDispose(() => {
              if (element.value) delegatedByElement.delete(element.value)
            })

            return listenablesByType
          }
        ),
        narrowedElement = element || useBody().element,
        toDelegatedByElementEntries = createToDelegatedByElementEntries(delegatedByElement),
        createWithDelegatedOption = <FactoryOptions extends PointerpressOptions | KeypressOptions>(
          { pressKind, option, toElementOrDomCoordinates }: {
            pressKind: (
              Required<FactoryOptions> extends Required<PointerpressOptions> ? 'pointer' :
                Required<FactoryOptions> extends Required<KeypressOptions> ? 'keyboard' :
                  never
            ),
            option: (
              Required<FactoryOptions> extends Required<PointerpressOptions> ? typeof supportedPointerOptions[number] :
                Required<FactoryOptions> extends Required<KeypressOptions> ? typeof supportedKeyboardOptions[number] :
                  never
            ),
            toElementOrDomCoordinates: (
              // @ts-expect-error
              api: Parameters<FactoryOptions[typeof option]>[0]
            ) => Parameters<typeof toDelegatedByElementEntries>[0],
          }
        ) => (
          api: (
            FactoryOptions extends Required<PointerpressOptions> ? PointerpressHookApi
              : FactoryOptions extends Required<KeypressOptions> ? KeypressHookApi
                : never
          ),
        ) => {
          status.value = (
            option !== 'onUp'
            && (
              option !== 'onOut'
              || (
                status.value === 'pressed'
                && (api.sequence.at(-1) as PointerEvent).relatedTarget !== null
              )
            )
          )
            ? 'pressed'
            : 'released'

          const delegatedByElementEntries: DelegatedByElementEntry<PressEffects, UsePressOptions>[] = (() => {
                  const delegatedByElementEntries = pipe(
                    () => toElementOrDomCoordinates(api),
                    toDelegatedByElementEntries
                  )()

                  if (
                    delegatedByElementEntries.length
                    || (
                      option !== 'onOut'
                      && !(
                        pressKind === 'pointer'
                        && option === 'onUp'
                        && (api.sequence.at(-1) as PointerEvent).pointerType === 'touch'
                      )
                    )
                  ) return delegatedByElementEntries

                  const element = pipe(
                    at(-1),
                    event => event.target as SupportedElement,
                    target => find<SupportedElement>(element => element.contains(target as SupportedElement))(pressableElements)
                  )(api.sequence)

                  return element
                    ? [
                      {
                        element,
                        delegated: delegatedByElement.get(element),
                      },
                    ]
                    : []
                })(),
                withoutInitialPointerOutSequence = (() => {
                  if (pressKind === 'keyboard') return api.sequence

                  return pipe(
                    findIndex<typeof api['sequence'][number]>(
                      event => event.type === 'pointerdown'
                    ),
                    index => createSlice(index)(api.sequence)
                  )(api.sequence)
                })()

          for (const { element, delegated } of delegatedByElementEntries) {
            if (option === 'onDown') pressableElements.add(element)

            if (
              !every<typeof api['sequence'][number]>(
                event => element.contains(event.target as HTMLElement)
              )(withoutInitialPointerOutSequence)
            ) pressableElements.delete(element)

            if (!pressableElements.has(element)) {
              deniedElements.add(element)
              continue
            }

            // @ts-expect-error
            delegated?.options[pressKind]?.[option]?.(api)
          }

          if (option === 'onUp') {
            pressableElements.clear()
            deniedElements.clear()
          }
        },
        pressableElements = new Set<SupportedElement>(),
        deniedElements = new Set<SupportedElement>(),
        status = ref<PressStatus>('released')

  // LISTENABLES BY TYPE
  let listenablesByType = {} as ReturnType<ReturnType<PressCreateOn>>
  for (const recognizeable of ['pointerpress', 'keypress'] as const) {
    const recognizeableEffects = (() => {
      switch (recognizeable) {
        case 'pointerpress':
          return createPointerpress({
            onDown: createWithDelegatedOption<PointerpressOptions>({ pressKind: 'pointer', option: 'onDown', toElementOrDomCoordinates: toEndPoint }),
            onMove: createWithDelegatedOption<PointerpressOptions>({ pressKind: 'pointer', option: 'onMove', toElementOrDomCoordinates: toEndPoint }),
            onOut: createWithDelegatedOption<PointerpressOptions>({ pressKind: 'pointer', option: 'onOut', toElementOrDomCoordinates: toEndPoint }),
            onUp: createWithDelegatedOption<PointerpressOptions>({ pressKind: 'pointer', option: 'onUp', toElementOrDomCoordinates: toEndPoint }),
          })
        case 'keypress':
          return createKeypress(['space', 'enter'], {
            onDown: createWithDelegatedOption<KeypressOptions>({ pressKind: 'keyboard', option: 'onDown', toElementOrDomCoordinates: toTarget }),
            onUp: createWithDelegatedOption<KeypressOptions>({ pressKind: 'keyboard', option: 'onUp', toElementOrDomCoordinates: toTarget }),
          })
      }
    })() as ReturnType<typeof createPointerpress>

    const newListenablesByType = on(
      narrowedElement,
      {
        ...defineRecognizeableEffect(narrowedElement, recognizeable as 'pointerpress', {
          createEffect: ({ listenable, ...api }) => event => {
            const delegatedByElementEntries: DelegatedByElementEntry<PressEffects, UsePressOptions>[] = pipe(
              () => recognizeable === 'keypress'
                ? event.target as SupportedElement
                : listenable.recognizeable.metadata.points.end,
              toDelegatedByElementEntries
            )()

            for (const { element, delegated } of delegatedByElementEntries) {
              if (
                !pressableElements.has(element)
                || deniedElements.has(element)
              ) continue

              delegated
                ?.effects
                [`recognizeable_${recognizeable}`]
                .createEffect({ listenable, ...api })(event)
            }
          },
          options: {
            listenable: { recognizeable: { effects: recognizeableEffects } },
          },
        }),
      }
    )

    listenablesByType = {
      ...listenablesByType,
      ...newListenablesByType,
    }
  }

  provide(
    PressInjectionKey,
    { createOn, getStatus: () => status.value }
  )
}

function toEndPoint (api: PointerpressHookApi) {
  return api.metadata.points?.end || { x: -1, y: -1 }
}

function toTarget (api: KeypressHookApi) {
  return api.sequence.at(-1).target as SupportedElement
}
