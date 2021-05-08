import type { BindValue, BindValueObject, Target } from '../util'
import { bindAttributeOrProperty } from './bindAttributeOrProperty'
import { bindList } from './bindList'
import { bindStyle } from './bindStyle'

export function bind (
  { target, keys }: {
    target: Target,
    keys: Record<string, BindValue<any>>,
  }
): void {
  Object.entries(keys).forEach(([key, value]) => {
    if (isList(key)) {
      bindList({
        target,
        list: key,
        value: (value as BindValueObject<typeof value>).targetClosure ?? value,
        watchSources: (value as BindValueObject<typeof value>).watchSources 
      })

      return
    }

    if (isStyle(key)) {
      bindStyle({
        target,
        property: toStyleProperty(key),
        value: (value as BindValueObject<typeof value>).targetClosure ?? value,
        watchSources: (value as BindValueObject<typeof value>).watchSources 
      })

      return
    }

    bindAttributeOrProperty<typeof value>({
      target,
      key,
      value: (value as BindValueObject<typeof value>).targetClosure ?? value,
      watchSources: (value as BindValueObject<typeof value>).watchSources 
    })
  })
}

export function defineBindValue<ValueType> (bindValue: BindValue<ValueType>): BindValue<ValueType> {
  return bindValue
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
