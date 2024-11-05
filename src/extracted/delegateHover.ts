import {
  provide,
  type InjectionKey,
  type Ref,
  type onMounted,
  type onScopeDispose,
  type watch,
} from 'vue'
import { pipe as chain } from 'lazy-collections'
import {
  createPointerhover,
  type PointerhoverType,
  type PointerhoverMetadata,
} from '@baleada/logic'
import {
  defineRecognizeableEffect,
  on,
  type OnEffectConfig,
} from '../affordances'
import { type UseHoverOptions } from '../extensions/useHover'
import { useBody } from './useBody'
import { type SupportedElement } from './toRenderedKind'
import {
  createToDelegatedByElementEntries,
  type Delegated,
  type DelegatedByElementEntry,
} from './createToDelegatedByElementEntries'

export type HoverCreateOn = (scoped: {
  watch: typeof watch,
  onMounted: typeof onMounted,
  onScopeDispose: typeof onScopeDispose,
  options: UseHoverOptions,
}) => typeof on<
  Ref<SupportedElement>,
  'recognizeable',
  PointerhoverMetadata
>

type HoverEffects = {
  recognizeable: OnEffectConfig<Ref<SupportedElement>, PointerhoverType, PointerhoverMetadata>,
}

export const HoverInjectionKey: InjectionKey<{ createOn: HoverCreateOn }> = Symbol('Hover')

export const supportedOptions: (keyof Pick<UseHoverOptions, 'onOver' | 'onOut'>)[] = ['onOver', 'onOut']

// TODO:
// - scoped onRender instead of onMounted?
export function delegateHover (element?: Ref<SupportedElement>) {
  const delegatedByElement = new WeakMap<SupportedElement, Delegated<HoverEffects, UseHoverOptions>>(),
        createOn: HoverCreateOn = scoped => (
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
                        ...effects,
                      } as unknown as HoverEffects,
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
        toDelegatedByElementEntries = createToDelegatedByElementEntries(delegatedByElement)

  // LISTENABLES BY TYPE
  const listenablesByType = on(
    narrowedElement,
    {
      ...defineRecognizeableEffect(narrowedElement, 'pointerhover', {
        createEffect: ({ listenable, ...api }) => event => chain(
          () => listenable.recognizeable.metadata.points.end,
          toDelegatedByElementEntries,
          (delegatedByElementEntries: DelegatedByElementEntry<HoverEffects, UseHoverOptions>[]) => {
            for (const { delegated } of delegatedByElementEntries) {
              delegated
                ?.effects
                ['recognizeable_pointerhover' as keyof HoverEffects]
                .createEffect({ listenable, ...api })(event)
            }
          }
        )(),
        options: {
          listenable: {
            recognizeable: {
              effects: createPointerhover({
                onOver: api => chain(
                  () => api.metadata.points.end,
                  toDelegatedByElementEntries,
                  (delegatedByElementEntries: DelegatedByElementEntry<HoverEffects, UseHoverOptions>[]) => {
                    for (const { delegated } of delegatedByElementEntries) {
                      delegated
                        ?.options
                        .onOver?.(api)
                    }
                  },
                )(),
                onOut: api => chain(
                  () => api.metadata.points?.end || { x: -1, y: -1 },
                  toDelegatedByElementEntries,
                  (delegatedByElementEntries: DelegatedByElementEntry<HoverEffects, UseHoverOptions>[]) => {
                    for (const { delegated } of delegatedByElementEntries) {
                      delegated
                        ?.options
                        .onOut?.(api)
                    }
                  },
                )(),
              }),
            },
          },
        },
      }),
    }
  ) as unknown as ReturnType<ReturnType<HoverCreateOn>>

  provide(HoverInjectionKey, { createOn })
}
