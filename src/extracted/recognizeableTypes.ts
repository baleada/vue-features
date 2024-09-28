import {
  type MousepressType,
  type MousepressMetadata,
  type MousereleaseType,
  type MousereleaseMetadata,
  type TouchpressType,
  type TouchpressMetadata,
  type TouchreleaseType,
  type TouchreleaseMetadata,
  type KeypressType,
  type KeypressMetadata,
  type KeyreleaseType,
  type KeyreleaseMetadata,
  type KeychordType,
  type KeychordMetadata,
  type HoverType,
  type HoverMetadata,
} from '@baleada/logic'

export type RecognizeableTypeByName = {
  mousepress: MousepressType,
  mouserelease: MousereleaseType,
  touchpress: TouchpressType,
  touchrelease: TouchreleaseType,
  keypress: KeypressType,
  keyrelease: KeyreleaseType,
  keychord: KeychordType,
  // konami: KonamiType,
  hover: HoverType,
}

export type RecognizeableMetadataByName = {
  mousepress: MousepressMetadata,
  mouserelease: MousereleaseMetadata,
  touchpress: TouchpressMetadata,
  touchrelease: TouchreleaseMetadata,
  keypress: KeypressMetadata,
  keyrelease: KeyreleaseMetadata,
  keychord: KeychordMetadata,
  // konami: KonamiMetadata,
  hover: HoverMetadata,
}
