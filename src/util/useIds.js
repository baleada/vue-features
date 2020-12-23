import { ref, computed, isRef, onMounted, nextTick, watch, getCurrentInstance } from 'vue'
import { nanoid } from 'nanoid'
import catchWithNextTick from './catchWithNextTick.js'

export default function useIds ({ target: rawTarget, watchSources = [] }, options) {
  const ids = ref([]),
        target = ensureTarget(rawTarget),
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

  return ids
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
