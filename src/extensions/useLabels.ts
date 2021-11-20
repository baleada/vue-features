import type { Ref } from 'vue'
import { bind, identify } from '../affordances'
import type { Id } from '../affordances'
import { useIdentifieds } from '../extracted'

export type Labels<BindsHtmlFor extends boolean> = {
  roots: ReturnType<typeof useIdentifieds>,
} & (BindsHtmlFor extends true ? { labelled: { ids: Id<HTMLElement[]> } } : Record<never, never>)

export type UseLabelOptions<BindsHtmlFor extends boolean> = {
  bindsHtmlFor?: BindsHtmlFor,
}

export function useLabels<BindsHtmlFor extends boolean> (elements: Ref<HTMLElement[]>, options: UseLabelOptions<BindsHtmlFor> = {}): Labels<BindsHtmlFor> {
  const roots = useIdentifieds({
    identifying: elements,
    attribute: 'ariaLabelledby',
  })
  
  if (options.bindsHtmlFor) {
    const labelledIds = identify({ element: elements })

    bind({
      element: elements,
      values: {
        id: ({ index }) => labelledIds.value[index],
      }
    })
  
    bind({
      element: roots.elements,
      values: {
        htmlFor: ({ index }) => labelledIds.value[index],
      },
    })

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
