import type { Component } from 'vue'
import { SupportedElement } from '../extracted'

export function toComponentRef (fn: (el: SupportedElement) => void, refName?: string): (component: Component) => void {
  return component => {
    if (refName) {
      // @ts-ignore
      if (component?.$refs?.[refName]) {
        // @ts-ignore
        fn(component?.$refs?.[refName])
      }
      return
    }

    // @ts-ignore
    if (component?.$el) {
      // @ts-ignore
      fn(component?.$el)
    }
  }
}
