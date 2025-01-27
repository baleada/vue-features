import { onMounted, ref } from 'vue'

export function useSupportsCss (css: Parameters<typeof CSS['supports']>[0]) {
  const supports = ref(false)

  onMounted(() => {
    supports.value = CSS.supports(css)
  })

  return supports
}
