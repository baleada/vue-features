import { type Ref } from 'vue'
import {
  type BindElement,
  type TransitionOption,
} from '../affordances'
import { type Plane } from './plane'
import { type SupportedElement } from './toRenderedKind'

export type TransitionOptionCreator<B extends BindElement> = B extends Plane<SupportedElement> | Ref<Plane<SupportedElement>>
  ? (plane: B) => TransitionOption<B>
  : B extends SupportedElement[] | Ref<SupportedElement[]>
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
