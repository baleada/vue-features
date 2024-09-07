import type { SupportedElement } from './toRenderedKind'

export function toElementOrDomCoordinates (event: MouseEvent | TouchEvent | KeyboardEvent) {
  return event instanceof KeyboardEvent
    ? event.target as SupportedElement
    : event instanceof TouchEvent
      ? {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      }
      : { x: event.clientX, y: event.clientY }
}
