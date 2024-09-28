import { type Ref, type ShallowReactive } from 'vue'
import { useListenable } from '@baleada/vue-composition'
import {
  createClip,
  createMap,
  type Listenable,
  type ListenableOptions,
  type ListenableSupportedType,
  type ListenEffect,
  type ListenOptions,
} from '@baleada/logic'
import {
  narrowReactivePlane,
  narrowListenOptions,
  onPlaneRendered,
  toEntries,
  toRenderedKind,
  predicateRenderedWatchSourcesChanged,
  type Plane,
  type Rendered,
  type RecognizeableTypeByName,
  type RecognizeableMetadataByName,
  type OnPlaneRenderedOptions,
  type Coordinates,
  type SupportedElement,
} from '../extracted'

export type ListenablesByType<
  Type extends ListenableSupportedType = ListenableSupportedType,
  RecognizeableMetadata extends Record<any, any> = Record<any, any>,
> = Record<
  Type,
  ShallowReactive<Listenable<Type, RecognizeableMetadata>>
>

export type OnElement = Rendered<SupportedElement>

export type OnEffect<
  O extends OnElement,
  Type extends ListenableSupportedType = ListenableSupportedType,
  RecognizeableMetadata extends Record<any, any> = Record<any, any>,
> = ListenEffect<Type> | OnEffectConfig<O, Type, RecognizeableMetadata>

export type OnEffectConfig<
  O extends OnElement,
  Type extends ListenableSupportedType = ListenableSupportedType,
  RecognizeableMetadata extends Record<any, any> = Record<any, any>,
> = {
  createEffect: OnEffectCreator<O, Type, RecognizeableMetadata>,
  options?: {
    listenable?: ListenableOptions<Type, RecognizeableMetadata>,
    listen?: Type extends 'intersect'
      ? {
        observer?: Omit<ListenOptions<'intersect'>['observer'], 'root'> & {
          root?: ListenOptions<'intersect'>['observer']['root'] | Ref<ListenOptions<'intersect'>['observer']['root']>,
        },
      }
      : ListenOptions<Type>,
  },
}

export type OnEffectCreator<
  O extends OnElement,
  Type extends ListenableSupportedType = ListenableSupportedType,
  RecognizeableMetadata extends Record<any, any> = Record<any, any>,
> = O extends Plane<SupportedElement> | Ref<Plane<SupportedElement>>
  ? (
    coordinates: Coordinates,
    api: {
      off: () => ShallowReactive<Listenable<Type, RecognizeableMetadata>>,
      listenable: ShallowReactive<Listenable<Type, RecognizeableMetadata>>,
    }
  ) => ListenEffect<Type>
  : O extends SupportedElement[] | Ref<SupportedElement[]>
    ? (
      index: number,
      api: {
        off: () => void,
        listenable: ShallowReactive<Listenable<Type, RecognizeableMetadata>>,
      }
    ) => ListenEffect<Type>
    : (
      api: {
        off: () => void,
        listenable: ShallowReactive<Listenable<Type, RecognizeableMetadata>>,
      }
    ) => ListenEffect<Type>

export function on<
  O extends OnElement,
  Type extends ListenableSupportedType = ListenableSupportedType,
  RecognizeableMetadata extends Record<any, any> = Record<any, any>,
> (
  elementOrListOrPlane: O,
  effects: { [type in Type]: OnEffect<O, type, RecognizeableMetadata> },
): ListenablesByType<Type, RecognizeableMetadata> {
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
            },
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
        effect: OnPlaneRenderedOptions<SupportedElement, any>['itemEffect'] = (element, { row, column }) => {
          if (!element) return

          for (const { listenable, listenParams: { createEffect, options } } of narrowedEffects) {
            listenable.stop({ target: element })

            const off = () => listenable.stop({ target: element })

            listenable.listen(
              ((...listenEffectParams) => {
                const listenEffect = renderedKind === 'plane'
                  ? (createEffect as OnEffectCreator<Plane<SupportedElement>, Type, RecognizeableMetadata>)(
                    { row, column },
                    { off, listenable }
                  )
                  : renderedKind === 'list'
                    ? (createEffect as OnEffectCreator<SupportedElement[], Type, RecognizeableMetadata>)(
                      column,
                      { off, listenable }
                    )
                    : (createEffect as OnEffectCreator<SupportedElement, Type, RecognizeableMetadata>)(
                      { off, listenable }
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

  return (() => {
    const listenablesByType = {} as ListenablesByType<Type, RecognizeableMetadata>

    for (let i = 0; i < effectsEntries.length; i++) {
      const [type] = effectsEntries[i],
            { listenable } = narrowedEffects[i]

      listenablesByType[withoutRecognizeable(type)] = listenable
    }

    return listenablesByType
  })()
}

function narrowListenParams<
  O extends OnElement,
  Type extends ListenableSupportedType = ListenableSupportedType,
  RecognizeableMetadata extends Record<any, any> = Record<any, any>,
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
    [`recognizeable_${name}`]: effect,
  } as unknown as {
    [type in RecognizeableTypeByName[Name]]: OnEffect<O, type, RecognizeableMetadataByName[Name]>
  }
}

const withoutRecognizeable = createClip(/^recognizeable_/)
