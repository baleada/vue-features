import { createMultiRef } from '../transforms'
import { useElementApi } from './useElementApi'
import type { ElementApi } from './useElementApi'
import type { Targetability } from './targetability'

export type RootAndKeyboardTarget<
  RootMeta extends Record<any, any> = Record<never, never>
> = {
  root: ElementApi<HTMLElement, true, RootMeta>,
  keyboardTarget: ElementApi<HTMLElement, true, { targetability: Targetability }>,
}

export type UseRootAndKeyboardTargetOptions<
  RootMeta extends Record<any, any> = Record<never, never>
> = {
  defaultRootMeta?: RootMeta,
}

export function useRootAndKeyboardTarget<
  RootMeta extends Record<any, any> = Record<never, never>
> (
  options: UseRootAndKeyboardTargetOptions<RootMeta> = {}
) {
  const { defaultRootMeta: defaultMeta } = options,
        root = useElementApi({
          identifies: true,
          defaultMeta,
        }),
        keyboardTarget = useElementApi({
          identifies: true,
          defaultMeta: { targetability: 'targetable' as Targetability },
        }),
        rootRef: (typeof root)['ref'] = meta => createMultiRef(
          root.ref(meta),
          keyboardTarget.ref(),
        )

  return {
    root: { ...root, ref: rootRef },
    keyboardTarget,
  }
}
