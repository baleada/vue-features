import type { Ref, ShallowReactive } from 'vue'
import { useListenable } from '@baleada/vue-composition'
import { createMap } from '@baleada/logic'
import type {
  Listenable,
  ListenableOptions,
  ListenableSupportedType,
  ListenEffect,
  ListenOptions,
} from '@baleada/logic'
import {
  narrowReactivePlane,
  narrowListenOptions,
  onPlaneRendered,
  toEntries,
  toRenderedKind,
  predicateRenderedWatchSourcesChanged,
} from '../extracted'
import type {
  Plane,
  Rendered,
  RecognizeableTypeByName,
  RecognizeableMetadataByName,
  OnPlaneRenderedOptions,
} from '../extracted'


export type OnElement = Rendered<HTMLElement>

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
> = O extends Plane<HTMLElement> | Ref<Plane<HTMLElement>>
  ? (
    coordinates: [row: number, column: number],
    api: {
      off: () => ShallowReactive<Listenable<Type, RecognizeableMetadata>>,
      listenable: ShallowReactive<Listenable<Type, RecognizeableMetadata>>
    }
  ) => ListenEffect<Type>
  : O extends HTMLElement[] | Ref<HTMLElement[]>
    ? (
      index: number,
      api: {
        off: () => void,
        listenable: ShallowReactive<Listenable<Type, RecognizeableMetadata>>
      }
    ) => ListenEffect<Type>
    : (
      api: {
        off: () => void,
        listenable: ShallowReactive<Listenable<Type, RecognizeableMetadata>>
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
  const elements = narrowReactivePlane(elementOrListOrPlane),
        renderedKind = toRenderedKind(elementOrListOrPlane),
        effectsEntries = toEntries(effects as Record<Type, OnEffect<O, Type>>) as [Type, OnEffect<O, Type>][],
        narrowedEffects = createMap<
          typeof effectsEntries[0],
          {
            listenable: ShallowReactive<Listenable<Type, RecognizeableMetadata>>,
            listenParams: {
              createEffect: OnEffectConfig<O, Type, RecognizeableMetadata>['createEffect'],
              options: OnEffectConfig<O, Type, RecognizeableMetadata>['options']['listen'],
            }
          }
        >(([type, listenParams]) => {
          const { createEffect, options } = narrowListenParams<O, Type, RecognizeableMetadata>(listenParams),
                narrowedType = type.startsWith('recognizeable') ? 'recognizeable' : type
          
          return {
            // @ts-expect-error
            listenable: useListenable<Type, RecognizeableMetadata>(narrowedType, options?.listenable),
            listenParams: { createEffect, options: options?.listen },
          }
        })(effectsEntries),
        effect: OnPlaneRenderedOptions<HTMLElement, any>['itemEffect'] = (element, [row, column]) => {
          if (!element) return

          for (const { listenable, listenParams: { createEffect, options } } of narrowedEffects) {
            listenable.stop()

            const off = () => listenable.stop()

            listenable.listen(
              ((...listenEffectParams) => {
                const listenEffect = renderedKind === 'plane'
                  ? (createEffect as OnEffectCreator<Plane<HTMLElement>, Type, RecognizeableMetadata>)(
                    [row, column],
                    { off, listenable } // Listenable instance gives access to Recognizeable metadata
                  )
                  : renderedKind === 'list'
                    ? (createEffect as OnEffectCreator<HTMLElement[], Type, RecognizeableMetadata>)(
                      column,
                      { off, listenable } // Listenable instance gives access to Recognizeable metadata
                    )
                    : (createEffect as OnEffectCreator<HTMLElement, Type, RecognizeableMetadata>)(
                      { off, listenable } // Listenable instance gives access to Recognizeable metadata
                      
                      )
                // @ts-expect-error
                listenEffect(...listenEffectParams)
              }) as ListenEffect<Type>,
              { ...narrowListenOptions(options), target: element }
            )
          }
        }

  onPlaneRendered(
    elements,
    {
      predicateRenderedWatchSourcesChanged,
      itemEffect: effect,
      watchSources: [],
    }
  )

  // useListenable cleans up side effects automatically
}

function narrowListenParams<
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
  Name extends keyof RecognizeableTypeByName
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
    [`recognizeable${name}`]: effect,
  } as unknown as {
    [type in RecognizeableTypeByName[Name]]: OnEffect<O, type, RecognizeableMetadataByName[Name]>
  }
}
