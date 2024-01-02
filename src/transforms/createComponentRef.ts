import type { Component } from 'vue'
import type { SupportedElement } from '../extracted'

export type CreateComponentRefOptions = {
  refName?: string
}

export function createComponentRef (
  fn: (el: SupportedElement) => void,
  options: CreateComponentRefOptions = {}
): (component: Component) => void {
  const { refName } = options

  return component => {
    if (refName) {
      fn(component?.[refName])
      return
    }

    // @ts-expect-error
    if (component?.$el) {
      // @ts-expect-error
      fn(component?.$el)
    }
  }
}
