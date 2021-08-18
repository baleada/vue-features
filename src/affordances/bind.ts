import type { WatchSource } from 'vue'
import { BindToValue, BindValue, Target, toEntries } from '../util'
import { bindAttributeOrProperty } from './bindAttributeOrProperty'
import { bindList } from './bindList'
import { bindStyle } from './bindStyle'

// This is where value type inference from key name would take place.
//
// For now, it doesn't seem to be worth the work. It seems barely feasible, but
// since browsers gracefully handle mistyped values, it may not even be desirable.
type BindSupportedKey = string
type Value<Key extends BindSupportedKey> = string | number | boolean

export type BindRequired<Key extends BindSupportedKey> = {
  target: Target,
  values: Record<Key, BindValue<Value<Key>> | BindToValueObject<Key>>
    | ((defineEffect: DefineBindValue<Key>) => [key: string, value: BindValue<Value<Key>> | BindToValueObject<Key>][]),
}

type DefineBindValue<Key extends BindSupportedKey> = 
  (key: Key, value: BindValue<Value<Key>>)
    => [key: Key, value: BindValue<Value<Key>>]

export type BindToValueObject<Key extends BindSupportedKey> = {
  toValue: BindToValue<Value<Key>>,
  watchSources: WatchSource | WatchSource[]
}

// All the Key infrastructure is not useful at the moment, but it lays the foundation for inferring value type from key name.
export function bind<Key extends BindSupportedKey> ({ target, values }: BindRequired<Key>): void {
  const valuesEntries = typeof values === 'function'
    ? values(createDefineBindValue())
    : toEntries(values)
  
  valuesEntries.forEach(([key, value]) => {
    if (isList(key)) {
      bindList({
        target,
        list: key,
        value: ensureValue(value) as BindValue<string>,
        watchSources: ensureWatchSources(value),
      })

      return
    }

    if (isStyle(key)) {
      bindStyle({
        target,
        property: toStyleProperty(key),
        value: ensureValue(value) as BindValue<string>,
        watchSources: ensureWatchSources(value),
      })
      

      return
    }

    bindAttributeOrProperty({
      target,
      key,
      value: ensureValue(value),
      watchSources: ensureWatchSources(value),
    })
  })
}

function createDefineBindValue<Key extends BindSupportedKey> (): DefineBindValue<Key> {
  return (type, effect) => {
    return [type, effect]
  }
}

function ensureValue<Key extends BindSupportedKey> (value: BindToValueObject<Key> | BindValue<Value<Key>>): BindValue<Value<Key>> {
  if (typeof value === 'object' && 'toValue' in value) {
    return value.toValue
  }

  return value
}

function ensureWatchSources<Key extends BindSupportedKey> (value: BindToValueObject<Key> | BindValue<Value<Key>>): WatchSource | WatchSource[] {
  if (typeof value === 'object' && 'watchSources' in value) {
    return value.watchSources
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
