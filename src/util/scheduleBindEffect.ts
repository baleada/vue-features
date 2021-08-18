import { isRef, onMounted, watch, nextTick } from 'vue'
import type { Ref } from 'vue'
import type { WatchSource } from 'vue'
import { ensureTargetsRef } from './ensureTargetsRef'
import type { Target } from './ensureTargetsRef'
import { ensureWatchSources } from './ensureWatchSources'

export type ScheduleBindValueEffectRequired<ValueType extends string | number | boolean> = {
  target: Target,
  effect: ({ target, value, index }:  { target: Element, value: ValueType, index?: number }) => any,
  value: BindValue<ValueType>,
  watchSources: WatchSource | WatchSource[],
}

export type BindValue<ValueType extends string | number | boolean> =
  ValueType
  | Ref<ValueType>
  | BindToValue<ValueType>
  
export type BindToValue<ValueType extends string | number | boolean> = ({ target, index }: { target: Element, index: number }) => ValueType

export function scheduleBindEffect<ValueType extends string | number | boolean> ({ target, effect, value, watchSources }: ScheduleBindValueEffectRequired<ValueType>): void {
  const ensuredTargets = ensureTargetsRef(target),
        ensuredWatchSources = ensureWatchSources(watchSources)
  
  // Schedule an effect to run with an updated reactive value.
  if (isRef(value)) {
    const scheduleable = () => ensuredTargets.value.forEach(target => {
      if (target) {
        effect({ target, value: value.value })
      }
    })

    nextTick(scheduleable)
    onMounted(() => 
      // Targets, user-defined watch sources, and the reactive value are watched.
      watch(
        [ensuredTargets, value, ...ensuredWatchSources],
        scheduleable,
        { flush: 'post' }
      )
    )

    return
  }

  // Schedule an efffect that binds a different value to each target in a v-for.
  if (typeof value === 'function') {
    const toValue = value,
          scheduleable = () => ensuredTargets.value.forEach((target, index) => {
            if (target) {
              effect({ target, value: toValue({ target, index }), index })
            }
          })

    nextTick(scheduleable)
    onMounted(() => 
      // Value is an unchanging toValue function, so only the targets and user-defined watch sources are watched.
      watch(
        [ensuredTargets, ...ensuredWatchSources],
        scheduleable,
        { flush: 'post' }        
      )
    )

    return
  }

  // Schedule an effect to run with the same primitive value each time.
  const scheduleable = () => ensuredTargets.value.forEach(target => {
    if (target) {
      effect({ target, value })
    }
  })
  
  nextTick(scheduleable)
  onMounted(() => 
    watch(
      // Value is an unchanging primitive, so only the targets and user-defined watch sources are watched.
      [ensuredTargets, ...ensuredWatchSources],
      scheduleable,
      { flush: 'post' }        
    )
  )
}
