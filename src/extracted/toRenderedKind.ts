import { isRef } from 'vue'
import type { Ref } from 'vue'
import { Plane } from './plane'

export type SupportedElement = HTMLElement // | Document | (Window & typeof globalThis)

export type SupportedRendered = SupportedElement | string | number | boolean | Record<any, any>

/**
 * An item collected by a function ref during Vue's render phase.
 */
export type Rendered<R extends SupportedRendered> = R
  | R[]
  | Plane<R>
  | Ref<R>
  | Ref<R[]>
  | Ref<Plane<R>>

export type RenderedKind = 'element' | 'list' | 'plane'

export function toRenderedKind<R extends SupportedRendered> (rendered: Rendered<R>): RenderedKind {
  if (isRef(rendered)) {
    if (rendered.value instanceof Plane) return 'plane'
    if (Array.isArray(rendered.value)) return 'list'
    return 'element'
  }

  if (rendered instanceof Plane) return 'plane'
  if (Array.isArray(rendered)) return 'list'
  return 'element'
}
