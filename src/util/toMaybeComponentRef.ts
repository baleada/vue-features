import type { Component } from 'vue'
import { SupportedElement } from '../extracted'
import { toComponentRef } from './toComponentRef'

export function toMaybeComponentRef (fn: (el: SupportedElement) => void, refName?: string): (component: Component | SupportedElement) => void {
  return maybeComponent => {
    if (isComponent(maybeComponent)) {
      toComponentRef(fn, refName)(maybeComponent)
      return
    }

    fn(maybeComponent)
  }
}

function isComponent (maybeComponent: any): maybeComponent is Component {
  return '$el' in maybeComponent
}
