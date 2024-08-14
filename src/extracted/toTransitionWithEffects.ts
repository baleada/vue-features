import type { BindElement } from '../affordances'
import type { ShowOptions, TransitionJs, TransitionCss } from '../affordances'
import { toTransitionTypes } from '../affordances/show'

export type TransitionEffects<B extends BindElement> = {
  appear?: {
    none?: TransitionJs<B>,
    js?: TransitionJs<B>,
    css?: TransitionCSSEffects,
  },
  enter?: {
    none?: TransitionJs<B>,
    js?: TransitionJs<B>,
    css?: TransitionCSSEffects,
  },
  leave?: {
    none?: TransitionJs<B>,
    js?: TransitionJs<B>,
    css?: TransitionCSSEffects,
  },
}

type TransitionCSSEffects = Pick<TransitionCss, 'start' | 'end' | 'cancel'>

export function toTransitionWithEffects<B extends BindElement> (
  effects: TransitionEffects<B>,
  options?: ShowOptions<B>
) {
  const transitionOption = options?.transition ?? {},
        transitionTypes = toTransitionTypes(transitionOption)
        const [enter, leave] = (['enter', 'leave'] as ['enter', 'leave']).map(stage => {
          if (transitionTypes[stage] === 'none') {
            return effects[stage]?.none || {} as TransitionJs<B>
          }

          if (transitionTypes[stage] === 'js') {
            return {
              before: (...args) => {
                // @ts-expect-error
                (transitionOption[stage] as TransitionJs<B>)?.before?.(...args)
                // @ts-expect-error
                effects[stage]?.js?.before?.(...args)
              },
              active: (...args) => {
                const withoutDone = args.slice(0, args.length - 1),
                      performTransitionEffect = () => {
                        // @ts-expect-error
                        effects[stage]?.js?.active?.(...args)
                      }

                // @ts-expect-error
                if ((transitionOption[stage] as TransitionJs<B>)?.active) (transitionOption[stage] as TransitionJs<B>)?.active?.(...withoutDone, performTransitionEffect)
                else performTransitionEffect()
              },
              after: (...args) => {
                // @ts-expect-error
                (transitionOption[stage] as TransitionJs<B>)?.after?.(...args)
                // @ts-expect-error
                effects[stage]?.js?.after?.(...args)
              },
              cancel: (...args) => {
                // @ts-expect-error
                (transitionOption[stage] as TransitionJs<B>)?.cancel?.(...args)
                // @ts-expect-error
                effects[stage]?.js?.cancel?.(...args)
              },
            } as TransitionJs<B>
          }

          return {
            ...(transitionOption[stage] as TransitionCss),
            start: () => {
              (transitionOption[stage] as TransitionCss).start?.()
              effects[stage]?.css?.start?.()
            },
            end: () => {
              (transitionOption[stage] as TransitionCss).end?.()
              effects[stage]?.css?.end?.()
            },
            cancel: () => {
              (transitionOption[stage] as TransitionCss).cancel?.()
              effects[stage]?.css?.cancel?.()
            },
          } as TransitionCss
        }),
        appear = (() => {
          if (transitionOption.appear === true) return enter

          if (transitionTypes.appear === 'none') {
            return effects.appear?.none || {} as TransitionJs<B>
          }

          if (transitionTypes.appear === 'js') {
            return {
              before: (...args) => {
                // @ts-expect-error
                (transitionOption.appear as TransitionJs<B>)?.before?.(...args)
                // @ts-expect-error
                effects.appear?.js?.before?.(...args)
              },
              active: (...args) => {
                const withoutDone = args.slice(0, args.length - 1),
                      performTransitionEffect = () => {
                        // @ts-expect-error
                        effects.appear?.js?.active?.(...args)
                      }

                // @ts-expect-error
                if ((transitionOption.appear as TransitionJs<B>)?.active) (transitionOption.appear as TransitionJs<B>)?.active?.(...withoutDone, performTransitionEffect)
                else performTransitionEffect()
              },
              after: (...args) => {
                // @ts-expect-error
                (transitionOption.appear as TransitionJs<B>)?.after?.(...args)
                // @ts-expect-error
                effects.appear?.js?.after?.(...args)
              },
              cancel: (...args) => {
                // @ts-expect-error
                (transitionOption.appear as TransitionJs<B>)?.cancel?.(...args)
                // @ts-expect-error
                effects.appear?.js?.cancel?.(...args)
              },
            } as TransitionJs<B>
          }

          return {
            ...(transitionOption.appear as TransitionCss),
            start: () => {
              (transitionOption.appear as TransitionCss).start?.()
              effects.appear?.css?.start?.()
            },
            end: () => {
              (transitionOption.appear as TransitionCss).end?.()
              effects.appear?.css?.end?.()
            },
            cancel: () => {
              (transitionOption.appear as TransitionCss).cancel?.()
              effects.appear?.css?.cancel?.()
            },
          } as TransitionCss
        })()

  return { appear, enter, leave }
}
