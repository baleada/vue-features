import {
  computed,
  provide,
  ref,
  type InjectionKey,
  type Ref,
} from 'vue'
import { bind } from '../affordances'
import type { SupportedElement } from './toRenderedKind'
import { useDocumentElement } from './useDocumentElement'

export type ScrollAllowance = {
  allow: () => ScrollAllowanceStatus,
  disallow: () => ScrollAllowanceStatus,
}

export type ScrollAllowanceStatus = 'allowed' | 'disallowed'

export const ScrollAllowanceInjectionKey: InjectionKey<ScrollAllowance> = Symbol('ScrollAllowance')

export function manageScrollAllowance (element?: Ref<SupportedElement>) {
  const narrowedElement = element ?? useDocumentElement().element,
        totalDisallowances = ref(0),
        allow = () => (totalDisallowances.value = Math.max(0, totalDisallowances.value - 1), status.value),
        disallow = () => (totalDisallowances.value++, status.value),
        status = computed(() => totalDisallowances.value === 0 ? 'allowed' : 'disallowed')

  provide(ScrollAllowanceInjectionKey, {
    allow,
    disallow,
  })

  bind(
    narrowedElement,
    {
      style_overflow: computed(() => status.value === 'allowed' ? null : 'hidden'),
      style_paddingRight: computed(() => (
        status.value === 'allowed'
          ? null
          : `${window.innerWidth - document.documentElement.clientWidth}px`
      )),
    }
  )
}

export const defaultScrollAllowance = {
  allow: () => 'allowed',
  disallow: () => 'disallowed',
}
