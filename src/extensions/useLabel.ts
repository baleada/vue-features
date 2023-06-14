import { bind, identify } from '../affordances'
import type { Id } from '../affordances'
import {
  useIdentified,
  narrowElementFromExtendable,
} from '../extracted'
import type { Extendable } from '../extracted'

export type Label<BindsHtmlFor extends boolean> = {
  root: ReturnType<typeof useIdentified>,
} & (BindsHtmlFor extends true ? { labelled: { id: Id<HTMLElement> } } : Record<never, never>)

export type UseLabelOptions<BindsHtmlFor extends boolean> = {
  bindsHtmlFor?: BindsHtmlFor,
}

export function useLabel<BindsHtmlFor extends boolean> (extendable: Extendable, options: UseLabelOptions<BindsHtmlFor> = {}): Label<BindsHtmlFor> {
  const element = narrowElementFromExtendable(extendable)

  const root = useIdentified({
    identifying: element,
    attribute: 'ariaLabelledbys',
  })
  
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
      }
    }
  }

  return {
    root,
  } as Label<BindsHtmlFor>
}
