import type { Ref } from 'vue'
import type { Target } from '../util'
import { bindAttributeOrProperty } from './bindAttributeOrProperty'
import { naiveOn, defineNaiveOnValue } from './naiveOn'

export type NaiveModelValue<ValueType> = Ref<ValueType>
export type NaiveModelOptions<ValueType, EventType extends Event = KeyboardEvent> = {
  key?: string,
  event?: string,
  toValue?: (event: EventType) => ValueType,
}

const defaultOptions: NaiveModelOptions<string, KeyboardEvent> = {
  key: 'value',
  event: 'input',
  toValue: event => (event.target as HTMLInputElement).value
}

export function naiveModel<ValueType = string, EventType extends Event = KeyboardEvent> (
  { target, value }: { target: Target, value: NaiveModelValue<ValueType> },
  options: NaiveModelOptions<ValueType, EventType> = {}
): void {
  const { key, event, toValue } = { ...defaultOptions, ...options }

  bindAttributeOrProperty({
    target,
    key,
    value,
  })
  
  naiveOn({
    target,
    events: {
      // @ts-ignore
      [event]: defineNaiveOnValue<EventType>(event => value.value = toValue(event))
    }
  })
}
