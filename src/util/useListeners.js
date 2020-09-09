import { onMounted, onBeforeUnmount } from 'vue'
import catchWithNextTick from './catchWithNextTick'

export default function useListeners ({ target, listeners }) {
  onMounted(() => {
    for (let eventType in listeners) {
      const { callback, options } = ensureListener(listeners[eventType])
      catchWithNextTick(() => target.value.addEventListener(eventType, callback, options))
    }
  })

  onBeforeUnmount(() => {
    for (let eventType in listeners) {
      const { callback, options } = ensureListener(listeners[eventType])
      catchWithNextTick(() => target.value.removeEventListener(eventType, callback, options))
    }
  })
}

function ensureListener (rawListener) {
  return typeof rawListener === 'function'
    ? { callback: rawListener }
    : rawListener
}
