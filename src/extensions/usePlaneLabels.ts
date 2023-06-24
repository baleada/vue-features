import type { Ref } from 'vue'
import { bind, identify } from '../affordances'
import type { Id } from '../affordances'
import { usePlaneIdentifieds } from '../extracted'
import type { Plane } from '../extracted'

export type PlaneLabels<BindsHtmlFor extends boolean> = {
  roots: ReturnType<typeof usePlaneIdentifieds>,
} & (BindsHtmlFor extends true ? { labelled: { ids: Id<Plane<HTMLElement>> } } : Record<never, never>)

export type UsePlaneLabelsOptions<BindsHtmlFor extends boolean> = {
  bindsHtmlFor?: BindsHtmlFor,
}

export function usePlaneLabels<BindsHtmlFor extends boolean> (elements: Ref<Plane<HTMLElement>>, options: UsePlaneLabelsOptions<BindsHtmlFor> = {}): PlaneLabels<BindsHtmlFor> {
  const roots = usePlaneIdentifieds({
    identifying: elements,
    attribute: 'ariaLabelledby',
  })
  
  if (options.bindsHtmlFor) {
    const labelledIds = identify(elements)

    bind(
      elements,
      { id: (row, column) => labelledIds.value[row]?.[column] }
    )
  
    bind(
      roots.elements,
      { htmlFor: (row, column) => labelledIds.value[row]?.[column] },
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
  } as PlaneLabels<BindsHtmlFor>
}
