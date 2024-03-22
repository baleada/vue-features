import type {
  MousepressType,
  MousepressMetadata,
  MousereleaseType,
  MousereleaseMetadata,
  TouchpressType,
  TouchpressMetadata,
  TouchreleaseType,
  TouchreleaseMetadata,
  KeypressType,
  KeypressMetadata,
  KeyreleaseType,
  KeyreleaseMetadata,
  KeychordType,
  KeychordMetadata,
  // KonamiType,
  // KonamiMetadata,
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
}
