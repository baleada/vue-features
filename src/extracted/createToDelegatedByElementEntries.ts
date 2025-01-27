import { type SupportedElement } from './toRenderedKind'

export type Delegated<Effects, Options> = {
  effects: Effects,
  options: Options,
}

export type DelegatedByElementEntry<Effects, Options> = {
  element: SupportedElement,
  delegated: Delegated<Effects, Options>,
}

export function createToDelegatedByElementEntries<Effects, Options> (
  delegatedByElement: WeakMap<SupportedElement, Delegated<Effects, Options>>
) {
  return (elementOrDomCoordinates: SupportedElement | { x: number, y: number }): DelegatedByElementEntry<Effects, Options>[] => {
    if (
      elementOrDomCoordinates instanceof HTMLElement
      || elementOrDomCoordinates instanceof SVGElement
    ) {
      return [{ element: elementOrDomCoordinates, delegated: delegatedByElement.get(elementOrDomCoordinates) }]
    }

    const { x, y } = elementOrDomCoordinates,
          delegatedByElementEntries: DelegatedByElementEntry<Effects, Options>[] = []

    for (const element of document.elementsFromPoint(x, y)) {
      const delegated = delegatedByElement.get(element as SupportedElement)

      if (!delegated) continue

      delegatedByElementEntries.push({
        element: element as SupportedElement,
        delegated,
      })
    }

    return delegatedByElementEntries
  }
}
