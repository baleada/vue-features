import type { SupportedElement } from '../extracted'

export function createMultiRef (
  ...fns: ((el: SupportedElement, refs?: Record<string, any>) => void)[]
): (el: SupportedElement, refs?: Record<string, any>) => void {
  return (...params) => {
    for (const fn of fns) fn(...params)
  }
}
