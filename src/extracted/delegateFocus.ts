import {
  provide,
  type InjectionKey,
  type Ref,
  type onMounted,
  type onScopeDispose,
  type watch,
} from 'vue'
import { on } from '../affordances'
import { useBody } from './useBody'
import { type SupportedElement } from './toRenderedKind'

export type FocusCreateOn = (scoped: {
  watch: typeof watch,
  onMounted: typeof onMounted,
  onScopeDispose: typeof onScopeDispose,
}) => typeof on<Ref<SupportedElement>, 'focusin' | 'focusout'>

type FocusEffects = {
  focusin: (event: FocusEvent) => void,
  focusout: (event: FocusEvent) => void,
}

export const focusInjectionKey: InjectionKey<{ createOn: FocusCreateOn }> = Symbol('Focus')

export function delegateFocus (element?: Ref<SupportedElement>) {
  const effectsByElement = new WeakMap<SupportedElement, FocusEffects>(),
        elements = new Set<SupportedElement>(),
        createOn: FocusCreateOn = scoped => (
          (element, effects) => {
            scoped.onMounted(() => {
              scoped.watch(
                element,
                (current, previous) => {
                  if (!current) {
                    if (previous) {
                      effectsByElement.delete(previous)
                      elements.delete(previous)
                    }
                    return
                  }

                  const existing = effectsByElement.get(current)

                  effectsByElement.set(
                    current,
                    {
                      ...existing,
                      ...effects,
                    } as unknown as FocusEffects
                  )
                  elements.add(current)
                },
                { immediate: true, flush: 'post' }
              )
            })

            scoped.onScopeDispose(() => {
              if (element.value) {
                effectsByElement.delete(element.value)
                elements.delete(element.value)
              }
            })

            return listenablesByType
          }
        ),
        narrowedElement = element || useBody().element

  const listenablesByType = on(
    narrowedElement,
    {
      focusin: event => {
        for (const element of elements) {
          if (!element.contains(event.target as Node)) continue
          effectsByElement.get(element)?.focusin?.(event)
        }
      },
      focusout: event => {
        for (const element of elements) {
          if (!element.contains(event.target as Node)) continue
          effectsByElement.get(element)?.focusout?.(event)
        }
      },
    }
  ) as unknown as ReturnType<ReturnType<FocusCreateOn>>

  provide(focusInjectionKey, { createOn })
}
