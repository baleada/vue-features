import { ref, computed, isRef, onMounted, nextTick, watch, getCurrentInstance } from 'vue'
import { nanoid } from 'nanoid'
import catchWithNextTick from './catchWithNextTick.js'

export default function useIds ({ target: rawTarget, watchSources = [] }, options) {
  const ids = ref([]),
        target = ensureTarget(rawTarget),
        targetType = toType(rawTarget),
        nanoids = new Map(),
        effect = () => {
          ids.value = target.value.map(el => {
            if (!nanoids.get(el)) {
              nanoids.set(el, nanoid())
            }

            return !!el.id ? el.id : nanoids.get(el)
          })
        }
  
  nextTick(() => effect())
  onMounted(() => {
    watch(
      [() => target.value, ...watchSources],
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

function ensureTarget (rawTarget) {
  return isRef(rawTarget)
    ? Array.isArray(rawTarget.value)
      ? rawTarget
      : computed(() => [rawTarget.value])
    : Array.isArray(rawTarget)
      ? computed(() => rawTarget)
      : computed(() => [rawTarget])
}

function toType (rawTarget) {
  return isRef(rawTarget)
    ? Array.isArray(rawTarget.value)
      ? 'multiple'
      : 'single'
    : Array.isArray(rawTarget)
      ? 'multiple'
      : 'single'
}
