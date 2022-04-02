import type { Ref } from 'vue'
import { bind, identify } from '../affordances'
import type { Id } from '../affordances'
import { useListIdentified } from '../extracted'

export type Labels<BindsHtmlFor extends boolean> = {
  roots: ReturnType<typeof useListIdentified>,
} & (BindsHtmlFor extends true ? { labelled: { ids: Id<HTMLElement[]> } } : Record<never, never>)

export type UseLabelOptions<BindsHtmlFor extends boolean> = {
  bindsHtmlFor?: BindsHtmlFor,
}

export function useLabels<BindsHtmlFor extends boolean> (elements: Ref<HTMLElement[]>, options: UseLabelOptions<BindsHtmlFor> = {}): Labels<BindsHtmlFor> {
  const roots = useListIdentified({
    identifying: elements,
    attribute: 'ariaLabelledby',
  })
  
  if (options.bindsHtmlFor) {
    const labelledIds = identify(elements)

    bind(
      elements,
      { id: index => labelledIds.value[index] }
    )
  
    bind(
      roots.elements,
      { htmlFor: index => labelledIds.value[index] },
    )

    return {
      roots,
      labelled: {
        ids: labelledIds,
      }
    }
  }

  return {
    roots,
  } as Labels<BindsHtmlFor>
}
