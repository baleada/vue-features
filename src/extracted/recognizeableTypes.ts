import {
  type PointerpressType,
  type PointerpressMetadata,
  type KeypressType,
  type KeypressMetadata,
  type KeyreleaseType,
  type KeyreleaseMetadata,
  type KeychordType,
  type KeychordMetadata,
  type PointerhoverType,
  type PointerhoverMetadata,
} from '@baleada/logic'

export type RecognizeableTypeByName = {
  pointerpress: PointerpressType,
  keypress: KeypressType,
  keyrelease: KeyreleaseType,
  keychord: KeychordType,
  // konami: KonamiType,
  pointerhover: PointerhoverType,
}

export type RecognizeableMetadataByName = {
  pointerpress: PointerpressMetadata,
  keypress: KeypressMetadata,
  keyrelease: KeyreleaseMetadata,
  keychord: KeychordMetadata,
  // konami: KonamiMetadata,
  pointerhover: PointerhoverMetadata,
}
