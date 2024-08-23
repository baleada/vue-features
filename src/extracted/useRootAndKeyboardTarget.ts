import { createMultiRef } from '../transforms'
import { useElementApi } from './useElementApi'
import type { ElementApi } from './useElementApi'
import type { Targetability } from './targetability'

export type RootAndKeyboardTarget<
  RootMeta extends Record<any, any> = Record<never, never>,
  KeyboardTargetMeta extends { targetability?: Targetability } = { targetability?: Targetability }
> = {
  root: ElementApi<HTMLElement, true, RootMeta>,
  keyboardTarget: ElementApi<HTMLElement, true, KeyboardTargetMeta>,
}

export type UseRootAndKeyboardTargetOptions<
  RootMeta extends Record<any, any> = Record<never, never>,
  KeyboardTargetMeta extends { targetability?: Targetability } = { targetability?: Targetability }
> = {
  defaultRootMeta?: RootMeta,
  defaultKeyboardTargetMeta?: KeyboardTargetMeta,
}

export function useRootAndKeyboardTarget<
  RootMeta extends Record<any, any> = Record<never, never>
> (
  options: UseRootAndKeyboardTargetOptions<RootMeta> = {}
) {
  const { defaultRootMeta, defaultKeyboardTargetMeta } = options,
        root = useElementApi({
          identifies: true,
          defaultMeta: defaultRootMeta,
        }),
        keyboardTarget = useElementApi({
          identifies: true,
          defaultMeta: {
            targetability: 'targetable' as Targetability,
            ...defaultKeyboardTargetMeta,
          },
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
