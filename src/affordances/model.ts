import type { Ref } from 'vue'
import type { Target } from '../util'
import { bind, defineBindValue } from './bind'
import { on, defineOnValue } from './on'

export type ModelValue<ValueType> = Ref<ValueType>
export type ModelOptions<ValueType, EventType extends Event = KeyboardEvent> = {
  key?: string,
  event?: string,
  toValue?: (event: EventType) => ValueType,
}

const defaultOptions: ModelOptions<string, KeyboardEvent> = {
  key: 'value',
  event: 'input',
  toValue: event => (event.target as HTMLInputElement).value
}

// TODO: Keep an eye out for v-model inside v-for use cases
// TODO:
// v-model internally uses different properties and emits different events for different input elements:
//     text and textarea elements use value property and input event;
//     checkboxes and radiobuttons use checked property and change event;
//     select fields use value as a prop and change as an event.
export function model<ValueType = string, EventType extends Event = KeyboardEvent> (
  { target, value }: { target: Target, value: ModelValue<ValueType> },
  options: ModelOptions<ValueType, EventType> = {}
): void {
  const { key, event, toValue } = { ...defaultOptions, ...options }

  bind({
    target,
    keys: {
      [key]: defineBindValue<ValueType>(value)
    }
  })
  
  on({
    target,
    events: {
      // @ts-ignore
      [event]: defineOnValue<EventType>(event => value.value = toValue(event))
    }
  })
}
