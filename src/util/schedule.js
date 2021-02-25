import { isRef, onMounted, watch, nextTick } from 'vue'
import ensureTargets from './ensureTargets.js'
import ensureWatchSources from './ensureWatchSources.js'

export default function schedule ({ target: rawTargets, effect: rawEffect, value: rawValue, watchSources: rawWatchSources }) {
  const targets = ensureTargets(rawTargets),
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
