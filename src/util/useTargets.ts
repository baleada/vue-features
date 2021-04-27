import { ref, onBeforeUpdate, onMounted, onUpdated } from 'vue'
import type { Ref } from 'vue'

export type SingleTarget = {
  target: Ref<null | Element>,
  handle: (el: Element) => any,
  api: SingleTargetApi,
}

export type SingleTargetApi = {
  ref: (el: Element) => any,
  el: Ref<null | Element>,
}

export function useSingleTarget (): SingleTarget {
  const target = ref<null | Element>(null),
        handle = (el: Element) => (target.value = el),
        api: SingleTargetApi = {
          ref: handle,
          el: target,
        }

  return { target, handle, api }
}

export type MultipleTargets = {
  targets: Ref<(null | Element)[]>,
  handle: (index: number) => (el: Element) => any,
  api: MultipleTargetsApi,
}

export type MultipleTargetsApi = {
  getRef: (index: number) => (el: Element) => any,
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
