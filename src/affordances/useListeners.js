import { isRef, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { catchWithNextTick } from '../util'

export default function useListeners ({ target: rawTarget, listeners: rawListeners }) {
  const target = ensureTarget(rawTarget),
        listeners = Object.entries(rawListeners).map(([eventType, rawListener]) => ({ eventType, listener: ensureListener(rawListener) })),
        activeListeners = [],
        effect = () => {
          listeners.forEach(({ eventType, listener: { callback, options } }) => {
            target.value.forEach(el => {
              if (!activeListeners.includes(el)) {
                el.addEventListener(eventType, callback, options)
                activeListeners.push(el)
              }
            })
          })
        },
        cleanup = () => {
          listeners.forEach(({ eventType, listener: { callback, options } }) => {
            activeListeners.forEach(el => el.removeEventListener(eventType, callback, options))
          })
        }

  nextTick(() => effect())
  
  onMounted(() => {
    watch(
      [() => target.value],
      () => catchWithNextTick(() => effect())
    )
  })

  onBeforeUnmount(() => cleanup())
}

function ensureListener (rawListener) {
  return typeof rawListener === 'function'
    ? { callback: rawListener }
    : rawListener
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
