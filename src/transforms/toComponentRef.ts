import type { Component } from 'vue'
import type { SupportedElement } from '../extracted'

export function toComponentRef (fn: (el: SupportedElement) => void, refName?: string): (component: Component) => void {
  return component => {
    if (refName) {
      // @ts-expect-error
      if (component?.$refs?.[refName]) {
        // @ts-expect-error
        fn(component?.$refs?.[refName])
      }
      return
    }

    // @ts-expect-error
    if (component?.$el) {
      // @ts-expect-error
      fn(component?.$el)
    }
  }
}
