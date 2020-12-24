import { ref, computed, isRef, onMounted, nextTick, watch, getCurrentInstance } from 'vue'
import { nanoid } from 'nanoid'
import catchWithNextTick from './catchWithNextTick.js'
import ensureTargets from './ensureTargets.js'

export default function useId ({ target: rawTargets, watchSources = [] }, options) {
  const ids = ref([]),
        targets = ensureTargets(rawTargets),
        targetType = toType(rawTargets),
        nanoids = new Map(),
        effect = () => {
          ids.value = targets.value.map(el => {
            if (!nanoids.get(el)) {
              nanoids.set(el, nanoid())
            }

            return !!el.id ? el.id : nanoids.get(el)
          })
        }
  
  nextTick(() => effect())
  onMounted(() => {
    watch(
      [() => targets.value, ...watchSources],
      () => catchWithNextTick(() => effect(), options),
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
