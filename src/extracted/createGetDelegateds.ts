import { type SupportedElement } from './toRenderedKind'

export type Delegated<Effects, Options> = {
  effects: Effects,
  options: Options,
}

export function createGetDelegateds<Effects, Options> (
  delegatedByElement: WeakMap<SupportedElement, Delegated<Effects, Options>>
) {
  return (elementOrDomCoordinates: SupportedElement | { x: number, y: number }) => {
    if (
      elementOrDomCoordinates instanceof HTMLElement
      || elementOrDomCoordinates instanceof SVGElement
    ) {
      return [delegatedByElement.get(elementOrDomCoordinates)]
    }

    const { x, y } = elementOrDomCoordinates,
          delegateds: Delegated<Effects, Options>[] = []

    let firstElement: SupportedElement | null = null
    for (const element of document.elementsFromPoint(x, y)) {
      const delegated = delegatedByElement.get(element as SupportedElement)

      if (!delegated) continue

      if (!firstElement) firstElement = element as SupportedElement

      if (element.contains(firstElement)) delegateds.push(delegated)
    }

    return delegateds
  }
}
