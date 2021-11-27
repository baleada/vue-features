import { shallowRef, onBeforeUnmount } from 'vue'

export function useEffecteds () {
  const effecteds = shallowRef(new Map<HTMLElement, number>())

  onBeforeUnmount(() => effecteds.value.clear())

  return effecteds
}
