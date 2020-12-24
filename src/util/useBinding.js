import { isRef, onMounted, watch, nextTick } from 'vue'
import { catchWithNextTick, ensureTargets } from '../util'

export default function useBinding ({ target: rawTargets, bind, value: rawValue, watchSources = [] }, options) {
  const targets = ensureTargets(rawTargets)
  
  if (isRef(rawValue)) {
    const effect = () => catchWithNextTick(() => targets.value.forEach(target => bind({ target, value: rawValue.value }), options))

    nextTick(() => effect())
    onMounted(() => 
      watch(
        [() => targets.value, () => rawValue.value, ...watchSources],
        () => effect(),
        { flush: 'post' }
      )
    )
  } else {
    const value = typeof rawValue === 'function'
            ? rawValue
            : () => rawValue,
          effect = () => catchWithNextTick(() => targets.value.forEach((target, index) => bind({ target, value: value({ target, index }) }), options))

    nextTick(() => effect())
    onMounted(() => 
      watch(
        [() => targets.value, ...watchSources],
        () => effect(),
        { flush: 'post' }        
      )
    )
  } 
}


