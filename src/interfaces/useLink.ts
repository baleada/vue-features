import { bind } from '../affordances'
import {
  useElementApi,
  toLabelBindValues,
  defaultLabelMeta,
} from '../extracted'
import type { IdentifiedElementApi, LabelMeta } from '../extracted'

export type Link = {
  root: IdentifiedElementApi<HTMLInputElement, LabelMeta>,
}

export type UseLinkOptions = Record<never, never>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultOptions: UseLinkOptions = {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useLink (options: UseLinkOptions = {}): Link {
  // ELEMENTS
  const root = useElementApi<HTMLInputElement, 'element', true>({
    identifies: true,
    defaultMeta: defaultLabelMeta,
  })

  
  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: 'link',
      ...toLabelBindValues(root),
      tabindex: 0,
    },
  )


  // API
  return {
    root,
  }
}
