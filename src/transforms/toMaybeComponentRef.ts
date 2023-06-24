import type { Component } from 'vue'
import type { SupportedElement } from '../extracted'
import { toComponentRef } from './toComponentRef'

export function toMaybeComponentRef (fn: (el: SupportedElement) => void, refName?: string): (component: Component | SupportedElement) => void {
  return maybeComponent => {
    if (predicateComponent(maybeComponent)) {
      toComponentRef(fn, refName)(maybeComponent)
      return
    }

    fn(maybeComponent)
  }
}

function predicateComponent (maybeComponent: any): maybeComponent is Component {
  return '$el' in maybeComponent
}
