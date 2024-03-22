import type { Ref } from 'vue'
import type { BindElement, TransitionOption } from '../affordances'
import type { Plane } from './plane'

export type TransitionOptionCreator<B extends BindElement> = B extends Plane<HTMLElement> | Ref<Plane<HTMLElement>>
  ? (plane: B) => TransitionOption<B>
  : B extends HTMLElement[] | Ref<HTMLElement[]>
    ? (list: B) => TransitionOption<B>
    : (element: B) => TransitionOption<B>

export function narrowTransitionOption<B extends BindElement> (
  elementOrListOrPlane: B,
  optionOrOptionCreator: TransitionOption<B> | TransitionOptionCreator<B>
): TransitionOption<B> {
  return typeof optionOrOptionCreator === 'function'
    // @ts-expect-error
    ? optionOrOptionCreator(elementOrListOrPlane) as TransitionOption<B>
    : optionOrOptionCreator
}
