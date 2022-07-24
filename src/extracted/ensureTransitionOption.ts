import { Ref } from 'vue'
import { BindElement, TransitionOption } from "../affordances"

export type TransitionOptionCreator<B extends BindElement> = B extends HTMLElement | Ref<HTMLElement>
  ? (element: B) => TransitionOption<B>
  : B extends HTMLElement[] | Ref<HTMLElement[]>
    ? (list: B) => TransitionOption<B>
    : (plane: B) => TransitionOption<B>

export function ensureTransitionOption<B extends BindElement> (
  elementOrListOrPlane: B,
  optionOrOptionCreator: TransitionOption<B> | TransitionOptionCreator<B>
): TransitionOption<B> {
  if (typeof optionOrOptionCreator === 'function') {
    // @ts-expect-error
    return optionOrOptionCreator(elementOrListOrPlane)
  }
  
  return optionOrOptionCreator
}
