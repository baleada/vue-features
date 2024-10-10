import { onMounted } from 'vue'
import { useElementApi } from './useElementApi'

export function useDocumentElement () {
  const documentElement = useElementApi()
  onMounted(() => documentElement.element.value = document.documentElement)
  return documentElement
}
