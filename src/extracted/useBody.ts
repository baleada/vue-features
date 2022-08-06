import { onMounted } from 'vue'
import { useElementApi } from './useElementApi'

export function useBody () {
  const body = useElementApi()
  onMounted(() => body.element.value = document.body)
  return body
}
