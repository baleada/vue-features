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

type DefineBindValue<Key extends BindSupportedKey> = 
  (key: Key, value: BindValue<Value<Key>>)
    => [key: Key, value: BindValue<Value<Key>>]

export type BindReactiveValueGetter<Value extends string | number | boolean> = {
  get: BindValueGetter<Value>,
  watchSource: WatchSource | WatchSource[]
}

export function bind<Key extends BindSupportedKey> (
  { element, values }: {
    element: BindElement,
    values: Record<Key, BindValue<Value<Key>> | BindReactiveValueGetter<Value<Key>>>
      | ((defineEffect: DefineBindValue<Key>) => [key: string, value: BindValue<Value<Key>> | BindReactiveValueGetter<Value<Key>>][]),
  }
): void {
  const valuesEntries = typeof values === 'function'
    ? values(createDefineBindValue())
    : toEntries(values)
  
  valuesEntries.forEach(([key, value]) => {
    if (isList(key)) {
      bindList({
        element,
        list: key,
        value: ensureValue(value) as BindValue<string>,
        watchSources: ensureWatchSourceOrSources(value),
      })

      return
    }

    if (isStyle(key)) {
      bindStyle({
        element,
        property: toStyleProperty(key),
        value: ensureValue(value) as BindValue<string>,
        watchSources: ensureWatchSourceOrSources(value),
      })
      

      return
    }

    bindAttributeOrProperty({
      element,
      key,
      value: ensureValue(value),
      watchSources: ensureWatchSourceOrSources(value),
    })
  })
}

function createDefineBindValue<Key extends BindSupportedKey> (): DefineBindValue<Key> {
  return (type, effect) => {
    return [type, effect]
  }
}

export function ensureValue<Key extends BindSupportedKey> (value: BindReactiveValueGetter<Value<Key>> | BindValue<Value<Key>>): BindValue<Value<Key>> {
  if (typeof value === 'object' && 'get' in value) {
    return value.get
  }

  return value
}

export function ensureWatchSourceOrSources<Key extends BindSupportedKey> (value: BindReactiveValueGetter<Value<Key>> | BindValue<Value<Key>>): WatchSource | WatchSource[] {
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
