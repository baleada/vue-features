import { ref, computed, isRef, onMounted, watch } from 'vue'
import { nanoid } from 'nanoid'
import { ensureTargets } from './ensureTargets.js'
import { ensureWatchSources } from './ensureWatchSources.js'

export function useId ({ target: rawTargets, watchSources: rawWatchSources }, options) {
  const ids = ref([]),
        targets = ensureTargets(rawTargets),
        watchSources = ensureWatchSources(rawWatchSources),
        targetType = toType(rawTargets),
        nanoids = new Map(),
        effect = () => {
          ids.value = targets.value.map(target => {
            if (!target) {
              return
            }

            if (!nanoids.get(target)) {
              nanoids.set(target, nanoid())
            }

            return !!target.id ? target.id : nanoids.get(target)
          })
        }
  
  onMounted(() => {
    effect()
    watch(
      [() => targets.value, ...watchSources],
      () => effect(),
      { flush: 'post' }
    )
  })

  switch (targetType) {
    case 'multiple':
      return computed(() => ids.value)
    case 'single':
      return computed(() => ids.value[0])
  }
}

function toType (rawTargets) {
  return isRef(rawTargets)
    ? Array.isArray(rawTargets.value)
      ? 'multiple'
      : 'single'
    : Array.isArray(rawTargets)
      ? 'multiple'
      : 'single'
}
