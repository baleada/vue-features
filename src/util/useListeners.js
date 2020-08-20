import { onMounted, onBeforeUnmount } from 'vue'

export default function useListeners ({ target, listeners }) {
  onMounted(() => {
    for (let eventType in listeners) {
      const { callback, options } = ensureListener(listeners[eventType])
      target.value.addEventListener(eventType, callback, options)
    }
  })

  onBeforeUnmount(() => {
    for (let eventType in listeners) {
      const { callback, options } = ensureListener(listeners[eventType])
      target.value.removeEventListener(eventType, callback, options)
    }
  })
}

function ensureListener (rawListener) {
  return typeof rawListener === 'function'
    ? { callback: rawListener }
    : rawListener
}
