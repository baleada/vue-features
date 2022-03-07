import type { WatchSource } from 'vue'
import {
  toEntries,
  bindAttributeOrProperty,
  bindList,
  bindStyle,
} from '../extracted'
import type { BindValueGetter, BindValue, BindElement } from '../extracted'

// This is where value type inference from key name would take place.
//
// For now, it doesn't seem to be worth the work. It seems barely feasible, but
// since browsers gracefully handle mistyped values, it's not desirable.
type BindSupportedKey = string
type Value<Key extends BindSupportedKey> = string | number | boolean

type DefineBindValue<B extends BindElement, Key extends BindSupportedKey> = 
  (key: Key, value: BindValue<B, Value<Key>>)
    => [key: Key, value: BindValue<B, Value<Key>>]

export type BindReactiveValueGetter<B extends BindElement, Value extends string | number | boolean> = {
  get: BindValueGetter<B, Value>,
  watchSource: WatchSource | WatchSource[]
}

export function bind<B extends BindElement, Key extends BindSupportedKey> (
  elementOrElements: B,
  values: Record<Key, BindValue<B, Value<Key>> | BindReactiveValueGetter<B, Value<Key>>>
    | ((defineEffect: DefineBindValue<B, Key>) => [key: string, value: BindValue<B, Value<Key>> | BindReactiveValueGetter<B, Value<Key>>][]),
): void {
  const valuesEntries = typeof values === 'function'
    ? values(createDefineBindValue())
    : toEntries(values)
  
  valuesEntries.forEach(([key, value]) => {
    if (isList(key)) {
      bindList(
        elementOrElements,
        key,
        ensureValue(value) as BindValue<B, string>,
        ensureWatchSourceOrSources(value),
      )

      return
    }

    if (isStyle(key)) {
      bindStyle(
        elementOrElements,
        toStyleProperty(key),
        ensureValue(value) as BindValue<B, string>,
        ensureWatchSourceOrSources(value),
      )
      
      return
    }

    bindAttributeOrProperty(
      elementOrElements,
      key,
      ensureValue(value),
      ensureWatchSourceOrSources(value),
    )
  })
}

function createDefineBindValue<B extends BindElement, Key extends BindSupportedKey> (): DefineBindValue<B, Key> {
  return (type, effect) => {
    return [type, effect]
  }
}

export function ensureValue<B extends BindElement, Key extends BindSupportedKey> (value: BindReactiveValueGetter<B, Value<Key>> | BindValue<B, Value<Key>>): BindValue<B, Value<Key>> {
  if (typeof value === 'object' && 'get' in value) {
    return value.get
  }

  return value
}

export function ensureWatchSourceOrSources<B extends BindElement, Key extends BindSupportedKey> (value: BindReactiveValueGetter<B, Value<Key>> | BindValue<B, Value<Key>>): WatchSource | WatchSource[] {
  if (typeof value === 'object' && 'watchSource' in value) {
    return value.watchSource
  }

  return []
}

const listRE = /^(?:class|rel)$/
function isList (key: string): key is 'class' | 'rel' {
  return listRE.test(key)
}

const styleRE = /^style_(\w+)$/
function isStyle (key: string): key is `style_${string}` {
  return styleRE.test(key)
}

function toStyleProperty (key: `style_${string}`): string {
  const { 1: property } = key.match(styleRE)
  return property as unknown as string
}
