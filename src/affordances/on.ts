import type { Ref } from 'vue'
import { useListenable } from '@baleada/vue-composition'
import { createMap } from '@baleada/logic'
import type { Listenable, ListenableOptions, ListenableSupportedType, ListenEffect, ListenOptions } from '@baleada/logic'
import {
  ensureReactivePlaneFromAffordanceElement,
  ensureListenOptions,
  createToEffectedStatus,
  schedule,
  toEntries,
  useEffecteds,
  toAffordanceElementKind,
} from '../extracted'
import type { AffordanceElement } from '../extracted'

export type DefineOnEffect<
  O extends OnElement,
  Type extends ListenableSupportedType = ListenableSupportedType,
  RecognizeableMetadata extends Record<any, any> = Record<any, any>
> = 
  <EffectType extends Type>(type: EffectType, effect: OnEffect<O, EffectType, RecognizeableMetadata>)
    => [type: Type, effect: OnEffect<O, Type, RecognizeableMetadata>]

export type OnElement = AffordanceElement<HTMLElement>

export type OnEffect<
  O extends OnElement,
  Type extends ListenableSupportedType = ListenableSupportedType,
  RecognizeableMetadata extends Record<any, any> = Record<any, any>
> = ListenEffect<Type> | OnEffectConfig<O, Type, RecognizeableMetadata>

export type OnEffectConfig<
  O extends OnElement,
  Type extends ListenableSupportedType = ListenableSupportedType,
  RecognizeableMetadata extends Record<any, any> = Record<any, any>
> = {
  createEffect: OnEffectCreator<O, Type, RecognizeableMetadata>,
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

export type OnEffectCreator<
  O extends OnElement,
  Type extends ListenableSupportedType = ListenableSupportedType,
  RecognizeableMetadata extends Record<any, any> = Record<any, any>
> = O extends Map<number, HTMLElement[]>
  ? (
    row: number,
    column: number,
    api: {
      off: () => void,
      listenable: Ref<Listenable<Type, RecognizeableMetadata>>
    }
  ) => ListenEffect<Type>
  : O extends Ref<Map<number, HTMLElement[]>>
    ? (
      row: number,
      column: number,
      api: {
        off: () => void,
        listenable: Ref<Listenable<Type, RecognizeableMetadata>>
      }
    ) => ListenEffect<Type>
    : (
      index: number,
      api: {
        off: () => void,
        listenable: Ref<Listenable<Type, RecognizeableMetadata>>
      }
    ) => ListenEffect<Type>

export function on<
  O extends OnElement,
  Type extends ListenableSupportedType = ListenableSupportedType,
  RecognizeableMetadata extends Record<any, any> = Record<any, any>
> (
  elementOrListOrPlane: O,
  effects: Record<Type, OnEffect<O, Type, RecognizeableMetadata>>
    | ((defineEffect: DefineOnEffect<O, Type, RecognizeableMetadata>) => [type: Type, effect: OnEffect<O, Type, RecognizeableMetadata>][])
) {
  const ensuredElements = ensureReactivePlaneFromAffordanceElement(elementOrListOrPlane),
        affordanceElementKind = toAffordanceElementKind(elementOrListOrPlane),
        effectsEntries = typeof effects === 'function'
          ? effects(createDefineOnEffect<O, Type, RecognizeableMetadata>())
          : toEntries(effects) as [Type, OnEffect<O, Type>][],
        ensuredEffects = createMap<
          typeof effectsEntries[0],
          {
            listenable: Ref<Listenable<Type, RecognizeableMetadata>>,
            listenParams: {
              createEffect: OnEffectConfig<O, Type, RecognizeableMetadata>['createEffect'],
              options: OnEffectConfig<O, Type, RecognizeableMetadata>['options']['listen'],
            }
          }
        >(([type, listenParams]) => {
          const { createEffect, options } = ensureListenParams<O, Type, RecognizeableMetadata>(listenParams)
          
          return {
            listenable: useListenable<Type, RecognizeableMetadata>(type, options?.listenable),
            listenParams: { createEffect, options: options?.listen }
          }
        })(effectsEntries),
        effecteds = useEffecteds(),
        effect = () => {
          effecteds.clear()

          for (const { listenable, listenParams: { createEffect, options } } of ensuredEffects) {
            for (let row = 0; row < ensuredElements.value.size; row++) {
              for (let column = 0; column < ensuredElements.value.get(0).length; column++) {
                const element = ensuredElements.value.get(row)[column]

                if (!element) return

                effecteds.set(element, [row, column])

                listenable.value.stop({ target: element })

                const off = () => {
                  listenable.value.stop({ target: element })
                }

                listenable.value.listen(
                  (listenEffectParam => {
                    const listenEffect = affordanceElementKind === 'plane'
                      ? (createEffect as OnEffectCreator<Map<number, HTMLElement[]>, Type, RecognizeableMetadata>)(row, column, {
                        off,
                        // Listenable instance gives access to Recognizeable metadata
                        listenable, 
                      })
                      : (createEffect as OnEffectCreator<HTMLElement[], Type, RecognizeableMetadata>)(column, {
                        off,
                        // Listenable instance gives access to Recognizeable metadata
                        listenable, 
                      })

                    return listenEffect(listenEffectParam)
                  }) as ListenEffect<Type>,
                  { ...ensureListenOptions(options), target: element }
                )
              }
            }
          }
        }

  schedule({
    effect,
    watchSources: [ensuredElements],
    toEffectedStatus: createToEffectedStatus(effecteds),
  })

  // useListenable cleans up side effects automatically
}

function createDefineOnEffect<
  O extends OnElement,
  Type extends ListenableSupportedType = ListenableSupportedType,
  RecognizeableMetadata extends Record<any, any> = Record<any, any>
> (): DefineOnEffect<O, Type, RecognizeableMetadata> {
  return ((type, effect) => {
    return [type, effect]
  }) as DefineOnEffect<O, Type, RecognizeableMetadata>
}

function ensureListenParams<
  O extends OnElement,
  Type extends ListenableSupportedType = ListenableSupportedType,
  RecognizeableMetadata extends Record<any, any> = Record<any, any>
> (effectOrEffectConfig: OnEffect<O, Type, RecognizeableMetadata>): OnEffectConfig<O, Type, RecognizeableMetadata> {
  return (
    typeof effectOrEffectConfig === 'function'
      ? { createEffect: () => effectOrEffectConfig }
      : {
          createEffect: effectOrEffectConfig.createEffect,
          options: effectOrEffectConfig.options,
        }
  ) as OnEffectConfig<O, Type, RecognizeableMetadata>
}
