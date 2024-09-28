import { unref } from 'vue'
import {
  type ListenableSupportedType,
  type ListenOptions,
} from '@baleada/logic'
import {
  type OnElement,
  type OnEffectConfig,
} from '../affordances'

export function narrowListenOptions<O extends OnElement, Type extends ListenableSupportedType> (options: OnEffectConfig<O, Type>['options']['listen']): ListenOptions<Type> {
  if (!options) {
    return {} as ListenOptions<Type>
  }

  if ('observer' in options && 'root' in options.observer) {
    return {
      observer: {
        ...options.observer,
        root: unref(options.observer.root),
      },
    } as ListenOptions<Type>
  }

  return options as ListenOptions<Type>
}
