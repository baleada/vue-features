import { bind } from '../affordances'
import {
  useElementApi,
  toLabelBindValues,
  defaultLabelMeta,
  type ElementApi,
  type LabelMeta,
} from '../extracted'

export type Link = {
  root: ElementApi<HTMLInputElement, true, LabelMeta>,
}

export type UseLinkOptions = Record<never, never>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultOptions: UseLinkOptions = {}

// TODO: Vue router integration
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useLink (options: UseLinkOptions = {}): Link {
  // ELEMENTS
  const root: Link['root'] = useElementApi({
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
