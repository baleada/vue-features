// NARROWERS
export { ensureListenOptions } from './ensureListenOptions'

export { ensureElementFromExtendable } from './ensureElementFromExtendable'
export type { Extendable } from './ensureElementFromExtendable'

export { ensureElementsFromAffordanceElement } from './ensureElementsFromAffordanceElement'
export type { SupportedElement, AffordanceElement } from './ensureElementsFromAffordanceElement'

export { ensureWatchSources } from './ensureWatchSources'

export { ensureWatchSourcesFromStatus } from './ensureWatchSourcesFromStatus'

export { ensureGetStatus } from './ensureGetStatus'
export type { StatusOption, GetStatus } from './ensureGetStatus'


// TRANSFORMS
export { toInputEffectNames } from './toInputEffectNames'

export { toEntries } from './toEntries'

export {
  toSymmetricalCompletion,
  toMappedCompletion,
  toMirroredCompletion,
  toHeadingCompletion,
  toHorizontalRuleCompletion,
} from './toMarkdownCompletion'
export type {
  SymmetricalInlinePunctuation,
  MappedBlockPunctuation,
  MirroredBlockPunctuation,
} from './toMarkdownCompletion'


// EFFECTS
export { schedule } from './schedule'

export { scheduleBind } from './scheduleBind'
export type {
  BindElement,
  BindValue,
  BindValueGetter,
} from './scheduleBind'

export { bindAttributeOrProperty } from './bindAttributeOrProperty'
export { bindList } from './bindList'
export { bindStyle } from './bindStyle'

export { focusedAndSelectedOn } from './focusedAndSelectedOn'


// EFFECT CREATORS
export { createEligibleNavigation } from './createEligibleNavigation'
export { createEligiblePicking } from './createEligiblePicking'


// UTIL CREATORS
export { createToNextEligible, createToPreviousEligible } from './createToEligible'
export type { ToEligibility } from './createToEligible'

export { createToEffectedStatus } from './createToEffectedStatus'


// COMPOSITION
export { useElementApi } from './useElementApi'
export type {
  ElementApi,
  MultipleIdentifiedElementsApi,
  SingleIdentifiedElementApi,
  MultipleElementsApi,
  SingleElementApi,
  UseElementOptions,
} from './useElementApi'

export { useHistory } from './useHistory'
export type { History, UseHistoryOptions } from './useHistory'

export { useIdentified } from './useIdentified'
export { useIdentifieds } from './useIdentifieds'

export { useStorage } from './useStorage'
export type { Storage, StorageOptions } from './useStorage'

export { useQuery } from './useQuery'

export { useEffecteds } from './useEffecteds'

export { useFocusedAndSelected } from './useFocusedAndSelected'
export type { FocusedAndSelected, UseFocusedAndSelectedConfig } from './useFocusedAndSelected'

export { usePopupTracking } from './usePopupTracking'
export type { PopupTracking, UsePopupTrackingOptions } from './usePopupTracking'
