import { shallowRef, type Ref } from 'vue'
import { bind, identify, type Id } from '../affordances'
import { type SupportedElement } from './toRenderedKind'

export type ElementApi<
  E extends SupportedElement,
  Identifies extends boolean = false,
  Meta extends Record<any, any> = Record<never, never>,
> = Identifies extends true
  ? ElementApiBase<E, Meta> & { id: Id<Ref<E>> }
  : ElementApiBase<E, Meta>

export type ElementApiBase<
  E extends SupportedElement,
  Meta extends Record<any, any> = Record<never, never>,
> = {
  ref: (meta?: Meta) => (element: E, refs?: Record<string, any>) => void,
  element: Ref<null | E>,
  meta: Ref<Meta>,
  status: Ref<{
    meta: 'changed' | 'none',
  }>,
}

export type UseElementApiOptions<Identifies extends boolean = false, Meta extends Record<any, any> = Record<never, never>> = {
  identifies?: Identifies,
  defaultMeta?: Meta,
}

export const defaultOptions: UseElementApiOptions<false, {}> = {
  identifies: false,
  defaultMeta: {},
}

export function useElementApi<
  E extends SupportedElement,
  Identifies extends boolean = false,
  Meta extends Record<any, any> = Record<never, never>,
> (options: UseElementApiOptions<Identifies, Meta> = {}): ElementApi<E, Identifies, Meta> {
  const { identifies, defaultMeta } = { ...defaultOptions, ...options }

  const element: ElementApi<E, false, {}>['element'] = shallowRef(null),
        meta: ElementApi<E, false, {}>['meta'] = shallowRef({}),
        ref: ElementApi<E, false, {}>['ref'] = m => newElement => {
          if (newElement) {
            element.value = newElement
            meta.value = { ...defaultMeta, ...m }
          }
        }

  if (identifies) {
    const id = identify(element)

    // @ts-expect-error
    bind(element, { id })

    return {
      ref,
      element,
      meta,
      id,
    } as ElementApi<E, Identifies, Meta>
  }

  return {
    ref,
    element,
    meta,
  } as ElementApi<E, Identifies, Meta>
}
