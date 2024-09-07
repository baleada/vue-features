import { provide } from 'vue'
import type { InjectionKey, Ref , onMounted, onScopeDispose, watch } from 'vue'
import { pipe as chain } from 'lazy-collections'
import { createHover } from '@baleada/logic'
import type { HoverType, HoverMetadata } from '@baleada/logic'
import { defineRecognizeableEffect, on } from '../affordances'
import type { OnEffectConfig } from '../affordances'
import type { UseHoverOptions } from '../extensions/useHover'
import { useBody } from './useBody'
import type { SupportedElement } from './toRenderedKind'
import { createGetDelegateds } from './createGetDelegateds'
import type { Delegated } from './createGetDelegateds'

export type HoverCreateOn = (scoped: {
  watch: typeof watch,
  onMounted: typeof onMounted,
  onScopeDispose: typeof onScopeDispose,
  options: UseHoverOptions,
}) => typeof on<
  Ref<SupportedElement>,
  'recognizeable',
  HoverMetadata
>

type HoverEffects = {
  recognizeable: OnEffectConfig<Ref<SupportedElement>, HoverType, HoverMetadata>,
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
                        ...effects ,
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
        getDelegateds = createGetDelegateds(delegatedByElement)

  // LISTENABLES BY TYPE
  const listenablesByType = on(
    narrowedElement,
    {
      ...defineRecognizeableEffect(narrowedElement, 'hover', {
        createEffect: ({ listenable, ...api }) => event => chain(
          () => listenable.recognizeable.metadata.points.end,
          getDelegateds,
          (delegateds: Delegated<HoverEffects, UseHoverOptions>[]) => {
            for (const delegated of delegateds) {
              delegated
                ?.effects
                ['recognizeable_hover' as keyof HoverEffects]
                .createEffect({ listenable, ...api })(event)
            }
          }
        )(),
        options: {
          listenable: {
            recognizeable: {
              effects: createHover({
                onOver: api => chain(
                  () => api.metadata.points.end,
                  getDelegateds,
                  delegateds => {
                    for (const delegated of delegateds) {
                      delegated
                        ?.options
                        .onOver?.(api)
                    }
                  },
                )(),
                onOut: api => chain(
                  () => api.metadata.points?.end || { x: -1, y: -1 },
                  getDelegateds,
                  delegateds => {
                    for (const delegated of delegateds) {
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
