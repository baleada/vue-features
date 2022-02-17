import { bind } from '../affordances'
import { useElementApi } from '../extracted'
import type { SingleIdentifiedElementApi } from '../extracted'

export type Link = {
  root: SingleIdentifiedElementApi<HTMLInputElement>,
}

export type UseLinkOptions = Record<never, never>

const defaultOptions: UseLinkOptions = {}

export function useLink (options: UseLinkOptions = {}): Link {
  // ELEMENTS
  const root = useElementApi<HTMLInputElement, false, true>({ identified: true })

  
  // BASIC BINDINGS
  bind(
    root.element,
    { role: 'link' },
  )


  // API
  return {
    root,
  }
}
