import type { Ref } from 'vue'
import { bind, identify } from '../affordances'
import type { Id } from '../affordances'
import { useListIdentifieds } from '../extracted'

export type ListLabels<BindsHtmlFor extends boolean> = {
  roots: ReturnType<typeof useListIdentifieds>,
} & (BindsHtmlFor extends true ? { labelled: { ids: Id<HTMLElement[]> } } : Record<never, never>)

export type UseListLabelsOptions<BindsHtmlFor extends boolean> = {
  bindsHtmlFor?: BindsHtmlFor,
}

export function useListLabels<BindsHtmlFor extends boolean> (elements: Ref<HTMLElement[]>, options: UseListLabelsOptions<BindsHtmlFor> = {}): ListLabels<BindsHtmlFor> {
  const roots = useListIdentifieds({
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
      },
    }
  }

  return {
    roots,
  } as ListLabels<BindsHtmlFor>
}
