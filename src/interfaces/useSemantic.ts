import type { HTMLAttributes } from 'vue'
import { bind } from '../affordances'
import {
  useElementApi,
  defaultLabelMeta,
  type ElementApi,
  type LabelMeta,
  type UseElementApiOptions,
  toLabelBindValues,
  type SupportedElement,
} from '../extracted'

export type Semantic<
  E extends SupportedElement = HTMLElement,
  Meta extends LabelMeta = LabelMeta,
> = {
  root: ElementApi<E, true, Meta>,
}

export type UseSemanticOptions<
  Meta extends LabelMeta = LabelMeta,
> = (
  & Pick<HTMLAttributes, 'role'>
  & UseElementApiOptions<true, Meta>
)

const defaultOptions: UseSemanticOptions = {
  role: 'generic',
  defaultMeta: defaultLabelMeta,
}

export function useSemantic<
  E extends SupportedElement = HTMLElement,
  Meta extends LabelMeta = LabelMeta,
> (options: UseSemanticOptions = {}): Semantic<E, Meta> {
  const { role, defaultMeta } = { ...defaultOptions, ...options } as UseSemanticOptions<Meta>


  // ELEMENTS
  const root: Semantic<E, Meta>['root'] = useElementApi<E, true, Meta>({
    identifies: true,
    defaultMeta,
  })


  // BASIC BINDINGS
  bind(
    root.element,
    {
      role,
      ...toLabelBindValues(root),
    }
  )


  // API
  return {
    root,
  }
}
