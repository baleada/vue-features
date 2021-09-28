
// ENSURES
export { ensureListenOptions } from './ensureListenOptions'

export { ensureElementFromExtendable } from './ensureElementFromExtendable'
export type { Extendable } from './ensureElementFromExtendable'

export { ensureElementsFromAffordanceElement } from './ensureElementsFromAffordanceElement'
export type { AffordanceElement } from './ensureElementsFromAffordanceElement'

export { ensureWatchSources } from './ensureWatchSources'


// TRANSFORMS
export { toInputEffectNames } from './toInputEffectNames'

export { toEntries } from './toEntries'

export {
  toSymmetricalCompletion,
  toMappedCompletion,
  toOpeningAndClosingCompletion,
} from './toMarkdownCompletion'
export type {
  SymmetricalInlinePunctuation,
  MappedBlockPunctuation,
  OpeningBlockPunctuation,
  ClosingBlockPunctuation,
} from './toMarkdownCompletion'


// EFFECTS
export { schedule } from './schedule'

export { scheduleBind, preventEffect } from './scheduleBind'
export type {
  ScheduleBindValueEffectRequired,
  BindElement,
  BindValue,
  BindValueGetter,
} from './scheduleBind'

export { bindAttributeOrProperty } from './bindAttributeOrProperty'
export { bindList } from './bindList'
export { bindStyle } from './bindStyle'


// COMPOSITION
export { useSingleElement, useMultipleElements } from './elementApi'
export type { SupportedElement, SingleElement, MultipleElements } from './elementApi'

export { useSingleId, useMultipleIds } from './idApi'

export { useHistory } from './useHistory'
export type { History, UseHistoryOptions } from './useHistory'

export { useIdentified } from './useIdentified'

export { useStorage } from './useStorage'
export type { Storage, StorageOptions } from './useStorage'
