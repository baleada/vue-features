import type { Component } from 'vue'
import { SupportedElement } from '../extracted'

export function toComponentRef (fn: (el: SupportedElement) => void, refName?: string): (component: Component) => void {
  return component => {
    if (refName) {
      // @ts-ignore
      fn(component.$refs[refName])
      return
    }

    // @ts-ignore
    fn(component.$el)
  }
}
