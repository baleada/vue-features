import { isRef, onMounted, watch, nextTick } from 'vue'
import ensureTargets from './ensureTargets.js'
import ensureWatchSources from './ensureWatchSources.js'

export default function useBinding ({ target: rawTargets, bind, value: rawValue, watchSources: rawWatchSources }, options) {
  const targets = ensureTargets(rawTargets),
        watchSources = ensureWatchSources(rawWatchSources)
  
  if (isRef(rawValue)) {
    const effect = () => targets.value.forEach(target => {
      if (target) {
        bind({ target, value: rawValue.value })
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
            bind({ target, value: value({ target, index }), index })
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
