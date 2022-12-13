import type { Ref } from 'vue'
import { useListenable } from '@baleada/vue-composition'
import { createMap } from '@baleada/logic'
import type { Listenable, ListenableOptions, ListenableSupportedType, ListenEffect, ListenOptions } from '@baleada/logic'
import {
  ensureReactivePlane,
  ensureListenOptions,
  createToEffectedStatus,
  schedule,
  toEntries,
  useEffecteds,
  toAffordanceElementKind,
  RecognizeableTypeByName,
  RecognizeableMetadataByName,
} from '../extracted'
import type { Plane, AffordanceElement } from '../extracted'


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
> = O extends Plane<HTMLElement>
  ? (
    row: number,
    column: number,
    api: {
      off: () => void,
      listenable: Ref<Listenable<Type, RecognizeableMetadata>>
    }
  ) => ListenEffect<Type>
  : O extends Ref<Plane<HTMLElement>>
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
  effects: { [type in Type]: OnEffect<O, type, RecognizeableMetadata> },
) {
  const ensuredElements = ensureReactivePlane(elementOrListOrPlane),
        affordanceElementKind = toAffordanceElementKind(elementOrListOrPlane),
        effectsEntries = toEntries(effects as Record<Type, OnEffect<O, Type>>) as [Type, OnEffect<O, Type>][],
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
          const { createEffect, options } = ensureListenParams<O, Type, RecognizeableMetadata>(listenParams),
                ensuredType = type.startsWith('recognizeable') ? 'recognizeable' : type
          
          return {
            // @ts-expect-error
            listenable: useListenable<Type, RecognizeableMetadata>(ensuredType, options?.listenable),
            listenParams: { createEffect, options: options?.listen }
          }
        })(effectsEntries),
        effecteds = useEffecteds(),
        effect = () => {
          effecteds.clear()

          for (const { listenable, listenParams: { createEffect, options } } of ensuredEffects) {
            for (let row = 0; row < ensuredElements.value.length; row++) {
              for (let column = 0; column < ensuredElements.value[0].length; column++) {
                const element = ensuredElements.value[row][column]

                if (!element) return

                effecteds.set(element, [row, column])

                listenable.value.stop({ target: element })

                const off = () => {
                  listenable.value.stop({ target: element })
                }

                listenable.value.listen(
                  ((...listenEffectParams) => {
                    const listenEffect = affordanceElementKind === 'plane'
                      ? (createEffect as OnEffectCreator<Plane<HTMLElement>, Type, RecognizeableMetadata>)(row, column, {
                        off,
                        // Listenable instance gives access to Recognizeable metadata
                        listenable, 
                      })
                      : (createEffect as OnEffectCreator<HTMLElement[], Type, RecognizeableMetadata>)(column, {
                        off,
                        // Listenable instance gives access to Recognizeable metadata
                        listenable, 
                      })

                    // @ts-expect-error
                    listenEffect(...listenEffectParams)
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

export function defineRecognizeableEffect<
  O extends OnElement,
  Name extends keyof RecognizeableTypeByName,
> (
  elementOrListOrPlane: O,
  name: Name,
  effect: OnEffect<
    O,
    RecognizeableTypeByName[Name],
    RecognizeableMetadataByName[Name]
  >
): { [type in RecognizeableTypeByName[Name]]: OnEffect<O, type, RecognizeableMetadataByName[Name]> } {
  return {
    [`recognizeable${name}`]: effect
  } as unknown as {
    [type in RecognizeableTypeByName[Name]]: OnEffect<O, type, RecognizeableMetadataByName[Name]>
  }
}
