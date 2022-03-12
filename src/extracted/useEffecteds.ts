import { onBeforeUnmount } from 'vue'

export function useEffecteds () {
  const effecteds = new Map<HTMLElement, [number, number]>()

  onBeforeUnmount(() => effecteds.clear())

  return effecteds
}
