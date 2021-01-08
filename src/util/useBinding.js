import { isRef, onMounted, watch, nextTick } from 'vue'
import ensureTargets from './ensureTargets.js'

export default function useBinding ({ target: rawTargets, bind, value: rawValue, watchSources = [] }, options) {
  const targets = ensureTargets(rawTargets)
  
  if (isRef(rawValue)) {
    const effect = () => targets.value.forEach(target => {
      if (target) {
        bind({ target, value: rawValue.value })
      }
    })

    nextTick(effect)
    onMounted(() => 
      watch(
        [() => targets.value, () => rawValue.value, ...watchSources],
        effect,
        { flush: 'post' }
      )
    )
  } else {
    const value = typeof rawValue === 'function'
            ? rawValue
            : () => rawValue,
          effect = () => targets.value.forEach((target, index) => {
            if (target) {
              bind({ target, value: value({ target, index }) })
            }
          })

    nextTick(effect)
    onMounted(() => 
      watch(
        [() => targets.value, ...watchSources],
        effect,
        { flush: 'post' }        
      )
    )
  } 
}


