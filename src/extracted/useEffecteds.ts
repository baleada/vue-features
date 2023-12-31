import { onScopeDispose } from 'vue'

export function useEffecteds () {
  const effecteds = new Map<HTMLElement, [number, number]>()

  onScopeDispose(() => effecteds.clear())

  return effecteds
}
