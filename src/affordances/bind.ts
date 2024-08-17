import type { WatchSource } from 'vue'
import { includes } from 'lazy-collections'
import {
  toEntries,
  bindAttributeOrProperty,
  bindList,
  bindStyle,
} from '../extracted'
import type { BindValueGetter, BindValue, BindElement } from '../extracted'

// This is where value type inference from key name would take place,
// but it's not worth the effort.
//
// It's feasible, but since browsers gracefully handle mistyped values,
// it's not desirable.
type BindSupportedKey = string
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Value<Key extends BindSupportedKey> = string | number | boolean

type DefineBindValue<B extends BindElement, Key extends BindSupportedKey> =
  (key: Key, value: BindValue<B, Value<Key>>)
    => [key: Key, value: BindValue<B, Value<Key>>]

export type BindReactiveValueGetter<B extends BindElement, Value extends string | number | boolean> = {
  get: BindValueGetter<B, Value>,
  watchSource: WatchSource | WatchSource[]
}

export function bind<B extends BindElement, Key extends BindSupportedKey> (
  elementOrListOrPlane: B,
  values: { [key in Key]: BindValue<B, Value<key>> | BindReactiveValueGetter<B, Value<key>> }
) {
  for (const [key, value] of toEntries(values)) {
    if (predicateList(key)) {
      bindList(
        elementOrListOrPlane,
        key,
        narrowBindValue(value) as BindValue<B, string>,
        narrowWatchSourceOrSources(value),
      )

      continue
    }

    if (predicateStyle(key)) {
      bindStyle(
        elementOrListOrPlane,
        toStyleProperty(key),
        narrowBindValue(value) as BindValue<B, string>,
        narrowWatchSourceOrSources(value),
      )

      continue
    }

    bindAttributeOrProperty(
      elementOrListOrPlane,
      key,
      narrowBindValue(value),
      narrowWatchSourceOrSources(value),
    )
  }
}

export function createDefineBindValue<B extends BindElement, Key extends BindSupportedKey> (): DefineBindValue<B, Key> {
  return (type, effect) => {
    return [type, effect]
  }
}

export function narrowBindValue<B extends BindElement, Key extends BindSupportedKey> (value: BindReactiveValueGetter<B, Value<Key>> | BindValue<B, Value<Key>>): BindValue<B, Value<Key>> {
  if (typeof value === 'object' && 'get' in value) {
    return value.get
  }

  return value
}

export function narrowWatchSourceOrSources<B extends BindElement, Key extends BindSupportedKey> (value: BindReactiveValueGetter<B, Value<Key>> | BindValue<B, Value<Key>>): WatchSource | WatchSource[] {
  if (typeof value === 'object' && 'watchSource' in value) {
    return value.watchSource
  }

  return []
}

const lists = [
  'class',
  'rel',
  'ariaDescribedbys',
  'ariaLabelledbys',
  'aria-describedbys',
  'aria-labelledbys',
]
function predicateList (key: string): key is Parameters<typeof bindList>[1] {
  return includes(key)(lists) as boolean
}

const styleRE = /^style_(\w+)$/
function predicateStyle (key: string): key is `style_${string}` {
  return styleRE.test(key)
}

function toStyleProperty (key: `style_${string}`): string {
  const { 1: property } = key.match(styleRE)
  return property as unknown as string
}
