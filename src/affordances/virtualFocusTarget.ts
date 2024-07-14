import { createDeepMerge } from '@baleada/logic'
import { watch } from 'vue'
import type { Ref } from 'vue'

export type VirtualFocusTargetOptions = {
  scrollIntoView?: ScrollIntoViewOptions,
}

const defaultOptions: VirtualFocusTargetOptions = {
  scrollIntoView: { block: 'nearest' },
}

export function virtualFocusTarget (
  withFocusedElement: { focusedElement: Ref<HTMLElement> },
  options: VirtualFocusTargetOptions = {}
) {
  const { scrollIntoView } = createDeepMerge(options)(defaultOptions)

  watch(
    withFocusedElement.focusedElement,
    element => element?.scrollIntoView(scrollIntoView),
    { flush: 'post' }
  )
}
