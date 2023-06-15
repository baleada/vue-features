import { SupportedElement } from "../extracted"

export function toMultiRef (...fns: ((el: SupportedElement) => void)[]): (el: SupportedElement) => void {
  return el => {
    for (const fn of fns) {
      fn(el)
    }
  }
}
