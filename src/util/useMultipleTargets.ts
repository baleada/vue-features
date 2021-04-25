import { ref, onBeforeUpdate, onMounted, onUpdated } from 'vue'
import type { Ref } from 'vue'

export type MultipleTargets = {
  targets: Ref<(null | Element)[]>,
  handle: (index: number) => (el: Element) => void,
  api: MultipleTargetsApi,
}

export type MultipleTargetsApi = {
  getRef: (index: number) => (el: Element) => void,
  els: Ref<(null | Element)[]>,
}

export function useMultipleTargets (options: { effect?: () => any } = {}): MultipleTargets {
  const { effect } = options

  const targets = ref<(null | Element)[]>([]),
        handle = (index: number) => (el: Element) => {
          if (el) targets.value[index] = el
        },
        api: MultipleTargetsApi = {
          getRef: handle,
          els: targets
        }

  onBeforeUpdate(() => (targets.value = []))

  onMounted(() => effect?.())
  onUpdated(() => effect?.())

  return { targets, handle, api } as MultipleTargets
}
