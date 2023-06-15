// NARROWERS
export { narrowElementFromExtendable } from './narrowElementFromExtendable'
export type { Extendable } from './narrowElementFromExtendable'

export { narrowListenOptions } from './narrowListenOptions'

export { narrowReactivePlane } from './narrowReactivePlane'
export type { Plane, SupportedElement, AffordanceElement } from './narrowReactivePlane'

export { narrowTransitionOption } from './narrowTransitionOption'
export type { TransitionOptionCreator } from './narrowTransitionOption'

export { narrowWatchSources } from './narrowWatchSources'

export { narrowValue } from './narrowValue'


// TRANSFORMS
export { toAffordanceElementKind } from './narrowReactivePlane'
export type { AffordanceElementKind } from './narrowReactivePlane'

export { toEntries } from './toEntries'

export { toInputEffectNames } from './toInputEffectNames'

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

export { toTransitionWithEffects } from './toTransitionWithEffects'
export type { TransitionEffects } from './toTransitionWithEffects'

export { toTransitionWithFocus } from './toTransitionWithFocus'

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


// EFFECT CREATORS
export { createEligibleInListNavigation } from './createEligibleInListNavigation'
export { createEligibleInListPicking } from './createEligibleInListPicking'


// PIPES
export type { ToListEligibility } from './createToEligibleInList'
export type { ToPlaneEligibility } from './createToEligibleInPlane'

export { createToEffectedStatus } from './createToEffectedStatus'


// COMPOSITION
export { useBody } from './useBody'
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


// SHARED ON
export { PressingInjectionKey, providePressingOn } from './providePressingOn'


// TYPES
export type { RecognizeableTypeByName, RecognizeableMetadataByName } from './recognizeableTypes'
