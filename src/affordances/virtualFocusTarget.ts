import { createDeepMerge } from '@baleada/logic'
import { watch } from 'vue'
import type { Ref } from 'vue'
import type { SupportedElement } from '../extracted'

export type VirtualFocusTargetOptions = {
  scrollIntoView?: ScrollIntoViewOptions,
}

const defaultOptions: VirtualFocusTargetOptions = {
  scrollIntoView: { block: 'nearest' },
}

export function virtualFocusTarget (
  withFocusedElement: { focusedElement: Ref<SupportedElement> },
  options: VirtualFocusTargetOptions = {}
) {
  const { scrollIntoView } = createDeepMerge(options)(defaultOptions)

  watch(
    withFocusedElement.focusedElement,
    element => element?.scrollIntoView(scrollIntoView),
    { flush: 'post' }
  )
}
