import type { Component } from 'vue'
import type { SupportedElement } from '../extracted'
import { createComponentRef } from './createComponentRef'
import type { CreateComponentRefOptions } from './createComponentRef'

export function createMaybeComponentRef (
  fn: (el: SupportedElement) => void,
  options: CreateComponentRefOptions = {}
): (component: Component | SupportedElement) => void {
  return maybeComponent => {
    if (predicateComponent(maybeComponent)) {
      createComponentRef(fn, options)(maybeComponent)
      return
    }

    fn(maybeComponent)
  }
}

function predicateComponent (maybeComponent: any): maybeComponent is Component {
  return '$el' in maybeComponent
}
