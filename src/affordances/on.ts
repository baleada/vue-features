import type { Ref } from 'vue'
import { useListenable } from '@baleada/vue-composition'
import type { Listenable, ListenableOptions, ListenableSupportedType, ListenEffect, ListenOptions } from '@baleada/logic'
import { ensureElementsRef, schedule, toEntries } from '../util'
import type { Target } from '../util'

type DefineOnEffect<Type extends ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> = 
  <EffectType extends Type>(type: EffectType, effect: OnEffect<EffectType, RecognizeableMetadata>)
    => [type: Type, effect: OnEffect<Type, RecognizeableMetadata>]

export type OnTarget = Target<Element | Document | (Window & typeof globalThis)>

export type OnEffect<Type extends ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> = ListenEffect<Type> | OnEffectObject<Type, RecognizeableMetadata>

export type OnEffectObject<Type extends ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> = {
  createEffect: OnCreateEffect<Type, RecognizeableMetadata>,
  options?: {
    listenable?: ListenableOptions<Type, RecognizeableMetadata>,
    listen?: ListenOptions<Type>,
  },
}

export type OnCreateEffect<Type extends ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> = ({ element, index: elementIndex, off }: {
  element: Element | Document | (Window & typeof globalThis),
  index: number,
  off: () => void,
  listenable: Ref<Listenable<Type, RecognizeableMetadata>>
}) => ListenEffect<Type>

// TODO: Support modifiers: https://v3.vuejs.org/api/directives.html#v-on
// Not all are necessary, as Listenable solves a lot of those problems.
// .once might be worth supporting.
export function on<Type extends ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> (
  { element, effects }: {
    element: OnTarget,
    effects: Record<Type, OnEffect<Type, RecognizeableMetadata>>
      | ((defineEffect: DefineOnEffect<Type, RecognizeableMetadata>) => [type: Type, effect: OnEffect<Type, RecognizeableMetadata>][])
  }
) {
  const ensuredElements = ensureElementsRef(element),
        effectsEntries = typeof effects === 'function'
          ? effects(createDefineOnEffect<Type, RecognizeableMetadata>())
          : toEntries(effects) as [Type, OnEffect<Type>][],
        ensuredEffects = effectsEntries.map(([type, rawListenParams]) => {
          const { createEffect, options } = ensureListenParams<Type, RecognizeableMetadata>(rawListenParams)
          
          return {
            listenable: useListenable<Type, RecognizeableMetadata>(type, options?.listenable),
            listenParams: { createEffect, options: options?.listen }
          }
        }),
        effect = () => {
          ensuredEffects.forEach(({ listenable, listenParams: { createEffect, options } }) => {            
            ensuredElements.value.forEach((element, index) => {
              if (!element) {
                return
              }

              listenable.value.stop({ target: element }) // Gotta clean up closures around potentially stale element indices.

              const off = () => {
                listenable.value.stop({ target: element })
              }

              listenable.value.listen(
                (listenEffectParam => {
                  const listenEffect = createEffect({
                    element,
                    index,
                    off,
                    // Listenable instance gives access to Recognizeable metadata
                    listenable, 
                  })

                  return listenEffect(listenEffectParam)
                }) as ListenEffect<Type>,
                { ...options, element }
              )
            })
          })
        }

  schedule({
    effect,
    watchSources: [() => ensuredElements.value],
  })

  // useListenable cleans up side effects automatically
}

function createDefineOnEffect<Type extends ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> (): DefineOnEffect<Type, RecognizeableMetadata> {
  return ((type, effect) => {
    return [type, effect]
  }) as DefineOnEffect<Type, RecognizeableMetadata>
}

function ensureListenParams<Type extends ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> (rawListenable: OnEffect<Type, RecognizeableMetadata>): OnEffectObject<Type, RecognizeableMetadata> {
  return typeof rawListenable === 'function'
    ? { createEffect: () => rawListenable }
    : {
        createEffect: rawListenable.createEffect,
        options: rawListenable.options,
      }
}
