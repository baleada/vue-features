import { bind, identify } from '../affordances'
import type { Id } from '../affordances'
import {
  useIdentified,
  narrowElement,
} from '../extracted'
import type { ExtendableElement } from '../extracted'

export type Label<BindsHtmlFor extends boolean> = {
  root: ReturnType<typeof useIdentified>,
} & (BindsHtmlFor extends true ? { labelled: { id: Id<HTMLElement> } } : Record<never, never>)

export type UseLabelOptions<BindsHtmlFor extends boolean> = {
  bindsHtmlFor?: BindsHtmlFor,
}

export function useLabel<BindsHtmlFor extends boolean> (extendable: ExtendableElement, options: UseLabelOptions<BindsHtmlFor> = {}): Label<BindsHtmlFor> {
  // ELEMENTS
  const element = narrowElement(extendable),
        root = useIdentified({
          identifying: element,
          attribute: 'ariaLabelledbys',
        })
  

  // BASIC BINDINGS
  if (options.bindsHtmlFor) {
    const labelledId = identify(element)

    bind(
      element,
      { id: labelledId }
    )
  
    bind(
      root.element,
      { htmlFor: labelledId }
    )

    return {
      root,
      labelled: {
        id: labelledId,
      },
    }
  }

  return {
    root,
  } as Label<BindsHtmlFor>
}
