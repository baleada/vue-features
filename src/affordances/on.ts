import type { Ref } from 'vue'
import { useListenable } from '@baleada/vue-composition'
import type { Listenable, ListenableOptions, ListenableSupportedType, ListenEffect, ListenOptions } from '@baleada/logic'
import {
  ensureReactiveMultipleFromAffordanceElement,
  ensureListenOptions,
  createToEffectedStatus,
  schedule,
  toEntries,
  useEffecteds,
} from '../extracted'
import type { AffordanceElement } from '../extracted'

type DefineOnEffect<Type extends ListenableSupportedType = ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> = 
  <EffectType extends Type>(type: EffectType, effect: OnEffect<EffectType, RecognizeableMetadata>)
    => [type: Type, effect: OnEffect<Type, RecognizeableMetadata>]

export type OnElement = AffordanceElement<HTMLElement>

export type OnEffect<Type extends ListenableSupportedType = ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> = ListenEffect<Type> | OnEffectObject<Type, RecognizeableMetadata>

export type OnEffectObject<Type extends ListenableSupportedType = ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> = {
  createEffect: OnEffectCreator<Type, RecognizeableMetadata>,
  options?: {
    listenable?: ListenableOptions<Type, RecognizeableMetadata>,
    listen?: Type extends 'intersect'
      ? {
        observer?: Omit<ListenOptions<'intersect'>['observer'], 'root'> & {
          root?: ListenOptions<'intersect'>['observer']['root'] | Ref<ListenOptions<'intersect'>['observer']['root']>
        }
      }
      : ListenOptions<Type>,
  },
}

export type OnEffectCreator<Type extends ListenableSupportedType = ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> = (
  index: number,
  api: {
    off: () => void,
    listenable: Ref<Listenable<Type, RecognizeableMetadata>>
  }
) => ListenEffect<Type>

// TODO: Support modifiers: https://v3.vuejs.org/api/directives.html#v-on
// Not all are necessary, as Listenable solves a lot of those problems.
// .once might be worth supporting.
export function on<Type extends ListenableSupportedType = ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> (
  elementOrElements: OnElement,
  effects: Record<Type, OnEffect<Type, RecognizeableMetadata>>
    | ((defineEffect: DefineOnEffect<Type, RecognizeableMetadata>) => [type: Type, effect: OnEffect<Type, RecognizeableMetadata>][])
) {
  const ensuredElements = ensureReactiveMultipleFromAffordanceElement(elementOrElements),
        effectsEntries = typeof effects === 'function'
          ? effects(createDefineOnEffect<Type, RecognizeableMetadata>())
          : toEntries(effects) as [Type, OnEffect<Type>][],
        ensuredEffects = effectsEntries.map(([type, listenParams]) => {
          const { createEffect, options } = ensureListenParams<Type, RecognizeableMetadata>(listenParams)
          
          return {
            listenable: useListenable<Type, RecognizeableMetadata>(type, options?.listenable),
            listenParams: { createEffect, options: options?.listen }
          }
        }),
        effecteds = useEffecteds(),
        effect = () => {
          effecteds.value.clear()

          ensuredEffects.forEach(({ listenable, listenParams: { createEffect, options } }) => {            
            ensuredElements.value.forEach((element, index) => {
              if (!element) {
                return
              }

              effecteds.value.set(element, index)

              listenable.value.stop({ target: element })

              const off = () => {
                listenable.value.stop({ target: element })
              }

              listenable.value.listen(
                (listenEffectParam => {
                  const listenEffect = createEffect(index, {
                    off,
                    // Listenable instance gives access to Recognizeable metadata
                    listenable, 
                  })

                  return listenEffect(listenEffectParam)
                }) as ListenEffect<Type>,
                { ...ensureListenOptions(options), target: element }
              )
            })
          })
        }

  schedule({
    effect,
    watchSources: [ensuredElements],
    toEffectedStatus: createToEffectedStatus(effecteds),
  })

  // useListenable cleans up side effects automatically
}

function createDefineOnEffect<Type extends ListenableSupportedType = ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> (): DefineOnEffect<Type, RecognizeableMetadata> {
  return ((type, effect) => {
    return [type, effect]
  }) as DefineOnEffect<Type, RecognizeableMetadata>
}

function ensureListenParams<Type extends ListenableSupportedType = ListenableSupportedType, RecognizeableMetadata extends Record<any, any> = Record<any, any>> (rawListenable: OnEffect<Type, RecognizeableMetadata>): OnEffectObject<Type, RecognizeableMetadata> {
  return typeof rawListenable === 'function'
    ? { createEffect: () => rawListenable }
    : {
        createEffect: rawListenable.createEffect,
        options: rawListenable.options,
      }
}
