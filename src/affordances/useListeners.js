import { onMounted, onBeforeUnmount } from 'vue'
import { catchWithNextTick } from '../util'

export default function useListeners ({ target, listeners }) {
  console.log({ target, listeners })
  Object.entries(listeners).forEach(([eventType, rawListener]) => {
    const { callback, options } = ensureListener(rawListener)

    onMounted(() => {
      console.log('onMounted')
      catchWithNextTick(() => target.value.addEventListener(eventType, callback, options))
    })

    onBeforeUnmount(() => {
      console.log('onBeforeUnmount')
      catchWithNextTick(() => target.value.removeEventListener(eventType, callback, options))
    })
  })
}

export function ensureListener (rawListener) {
  return typeof rawListener === 'function'
    ? { callback: rawListener }
    : rawListener
}
