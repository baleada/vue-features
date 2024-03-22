import type { SupportedElement } from '../extracted'

export function createMultiRef (...fns: ((el: SupportedElement) => void)[]): (el: SupportedElement) => void {
  return el => {
    for (const fn of fns) {
      fn(el)
    }
  }
}
