import { computed, isRef, onMounted, watch, nextTick } from 'vue'
import { catchWithNextTick } from '../util'

export default function useBinding ({ target: rawTarget, bind, value: rawValue, watchSources = [] }, options) {
  const target = ensureTarget(rawTarget)
  
  if (isRef(rawValue)) {
    const effect = () => catchWithNextTick(() => target.value.forEach(el => bind({ el, value: rawValue.value }), options))

    nextTick(() => effect())
    onMounted(() => 
      watch(
        [() => target.value, () => rawValue.value, ...watchSources],
        () => effect(),
        { flush: 'post' }
      )
    )
  } else {
    const value = typeof rawValue === 'function'
            ? rawValue
            : () => rawValue,
          effect = () => catchWithNextTick(() => target.value.forEach((el, index) => bind({ el, value: value({ el, index }) }), options))

    nextTick(() => effect())
    onMounted(() => 
      watch(
        [() => target.value, ...watchSources],
        () => effect(),
        { flush: 'post' }        
      )
    )
  } 
}

function ensureTarget (rawTarget) {
  return isRef(rawTarget)
    ? Array.isArray(rawTarget.value)
      ? rawTarget
      : computed(() => [rawTarget.value])
    : Array.isArray(rawTarget)
      ? computed(() => rawTarget)
      : computed(() => [rawTarget])
}


