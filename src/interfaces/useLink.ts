import { bind } from '../affordances'
import { useSemantic, type Semantic } from './useSemantic'

export type Link = Semantic<HTMLAnchorElement>

export type UseLinkOptions = Record<never, never>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultOptions: UseLinkOptions = {}

// TODO: Vue router integration
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useLink (options: UseLinkOptions = {}): Link {
  // ELEMENTS
  const { root }: Pick<Link, 'root'> = useSemantic({ role: 'link' })


  // BASIC BINDINGS
  bind(
    root.element,
    { tabindex: 0 },
  )


  // API
  return {
    root,
  }
}
