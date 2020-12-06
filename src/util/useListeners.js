import { onMounted, onBeforeUnmount } from 'vue'
import catchWithNextTick from './catchWithNextTick'

export default function useListeners ({ target, listeners }) {
  Object.entries(listeners).forEach(([eventType, rawListener]) => {
    const { callback, options } = ensureListener(rawListener)

    onMounted(() => {
      catchWithNextTick(() => target.value.addEventListener(eventType, callback, options))
    })

    onBeforeUnmount(() => {
      catchWithNextTick(() => target.value.removeEventListener(eventType, callback, options))
    })
  })
}

function ensureListener (rawListener) {
  return typeof rawListener === 'function'
    ? { callback: rawListener }
    : rawListener
}
