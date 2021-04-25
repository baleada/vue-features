import { ref, onBeforeUpdate, onMounted, onUpdated } from 'vue'
import type { Ref } from 'vue'

export type SingleTarget = {
  target: Ref<null | Element>,
  handle: (el: Element) => void,
  api: SingleTargetApi,
}

export type SingleTargetApi = {
  ref: (el: Element) => void,
  el: Ref<null | Element>,
}

export function useSingleTarget (options: { effect?: () => any } = {}): SingleTarget {
  const { effect } = options

  const target = ref<null | Element>(null),
        handle = (el: Element) => (target.value = el),
        api: SingleTargetApi = {
          ref: handle,
          el: target,
        }

  return { target, handle, api }
}
