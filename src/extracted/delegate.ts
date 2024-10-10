import type { Ref } from 'vue'
import { delegateHover } from './delegateHover'
import { delegatePress } from './delegatePress'
import type { SupportedElement } from './toRenderedKind'

export function delegate (element?: Ref<SupportedElement>) {
  return {
    hover: delegateHover(element),
    press: delegatePress(element),
  }
}
