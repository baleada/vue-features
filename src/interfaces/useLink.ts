import { bind } from '../affordances'
import { useElementApi } from '../extracted'
import type { IdentifiedElementApi } from '../extracted'

export type Link = {
  root: IdentifiedElementApi<HTMLInputElement>,
}

export type UseLinkOptions = Record<never, never>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const defaultOptions: UseLinkOptions = {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useLink (options: UseLinkOptions = {}): Link {
  // ELEMENTS
  const root = useElementApi<HTMLInputElement, 'element', true>({ identified: true })

  
  // BASIC BINDINGS
  bind(
    root.element,
    { role: 'link', tabindex: 0 },
  )


  // API
  return {
    root,
  }
}
