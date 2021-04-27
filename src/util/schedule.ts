import { isRef, onMounted, watch, nextTick } from 'vue'
import type { Ref } from 'vue'
import type { WatchSource } from 'vue'
import { ensureTargetsRef } from './ensureTargetsRef'
import type { Target } from './ensureTargetsRef'
import { ensureWatchSources } from './ensureWatchSources'

export type BindValue<ValueType> = 
  ValueType
  | Ref<ValueType>
  | BindTargetClosure<ValueType>
  | BindValueObject<ValueType>
  
export type BindTargetClosure<ValueType> = (({ target, index }: { target: Element, index: number }) => ValueType)

export type BindValueObject<ValueType> = { targetClosure: BindTargetClosure<ValueType>, watchSources: WatchSource | WatchSource[] }

export function schedule<ValueType> (
  { target: rawTargets, effect: rawEffect, value: rawValue, watchSources: rawWatchSources }: {
    target: Target,
    effect: ({ target, value, index }:  { target: Element, value: ValueType, index?: number }) => any,
    value: BindValue<ValueType>,
    watchSources?: WatchSource | WatchSource[],
  }
): void {
  const targets = ensureTargetsRef(rawTargets),
        watchSources = ensureWatchSources(rawWatchSources)
  
  if (isRef(rawValue)) {
    const effect = () => targets.value.forEach(target => {
      if (target) {
        rawEffect({ target, value: rawValue.value })
      }
    })

    nextTick(effect)
    onMounted(() => 
      watch(
        [targets, rawValue, ...watchSources],
        effect,
        { flush: 'post' }
      )
    )

    return
  }

  const value = typeof rawValue === 'function'
          ? rawValue
          : () => rawValue,
        effect = () => targets.value.forEach((target, index) => {
          if (target) {
            rawEffect({ target, value: value({ target, index }), index })
          }
        })

  nextTick(effect)
  onMounted(() => 
    watch(
      [targets, ...watchSources],
      effect,
      { flush: 'post' }        
    )
  )
}
