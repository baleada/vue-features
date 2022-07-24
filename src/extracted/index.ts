// NARROWERS
export { ensureElementFromExtendable } from './ensureElementFromExtendable'
export type { Extendable } from './ensureElementFromExtendable'

export { ensureGetStatus } from './ensureGetStatus'
export type { StatusOption, GetStatus } from './ensureGetStatus'

export { ensureListenOptions } from './ensureListenOptions'

export { ensureReactivePlane } from './ensureReactivePlane'
export type { Plane, SupportedElement, AffordanceElement } from './ensureReactivePlane'

export { ensureTransitionOption } from './ensureTransitionOption'
export type { TransitionOptionCreator } from './ensureTransitionOption'

export { ensureWatchSources } from './ensureWatchSources'

export { ensureWatchSourcesFromStatus } from './ensureWatchSourcesFromStatus'


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

export { toAffordanceElementKind } from './ensureReactivePlane'
export type { AffordanceElementKind } from './ensureReactivePlane'


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

export { listOn } from './listOn'

export { showAndFocusAfter } from './showAndFocusAfter'
export { showWithEffects } from './showWithEffects'

// EFFECT CREATORS
export { createEligibleInListNavigation } from './createEligibleInListNavigation'
export { createEligibleInListPicking } from './createEligibleInListPicking'


// UTIL CREATORS
export type { ToListEligibility } from './createToEligibleInList'
export type { ToPlaneEligibility } from './createToEligibleInPlane'

export { createToEffectedStatus } from './createToEffectedStatus'


// COMPOSITION
export { useElementApi } from './useElementApi'
export type {
  Api,
  IdentifiedPlaneApi,
  IdentifiedListApi,
  IdentifiedElementApi,
  PlaneApi,
  ListApi,
  ElementApi,
  UseElementOptions,
} from './useElementApi'

export { useHistory } from './useHistory'
export type { History, UseHistoryOptions } from './useHistory'

export { useIdentified } from './useIdentified'
export { useListIdentifieds } from './useListIdentifieds'
export { usePlaneIdentifieds } from './usePlaneIdentifieds'

export { useStorage } from './useStorage'
export type { Storage, UseStorageOptions } from './useStorage'

export { useListQuery } from './useListQuery'
export { usePlaneQuery } from './usePlaneQuery'

export { useEffecteds } from './useEffecteds'

export { useListState } from './useListState'
export type { ListState, UseListStateConfig } from './useListState'

export { usePlaneState } from './usePlaneState'
export type { PlaneState, UsePlaneStateConfig } from './usePlaneState'

export { usePopupTracking } from './usePopupTracking'
export type { PopupTracking, UsePopupTrackingOptions } from './usePopupTracking'
