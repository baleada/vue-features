import { onMounted, onBeforeUnmount } from 'vue'

export default function useListener ({ target, eventType, callback, options }) {
  onMounted(() => {
    target.value.addEventListener(eventType, callback, options)
  })

  onBeforeUnmount(() => {
    target.value.removeEventListener(eventType, callback, options)
  })
}