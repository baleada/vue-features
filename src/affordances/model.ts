import { ListenableSupportedType, ListenEffect, ListenEffectParam } from '@baleada/logic'
import type { Ref } from 'vue'
import type { Target } from '../util'
import { bind, defineBindValue } from './bind'
import { on } from './on'

export type ModelRequired<ValueType> = {
  target: Target,
  value: Ref<ValueType>
}

export type ModelOptions<ValueType, EventType extends ListenableSupportedType> = {
  key?: string,
  event?: EventType,
  toValue?: (event: ListenEffectParam<EventType>) => ValueType,
}

const defaultOptions: ModelOptions<string, 'input'> = {
  key: 'value',
  event: 'input',
  toValue: event => (event.target as HTMLInputElement).value
}

// TODO: Keep an eye out for v-model inside v-for use cases
//
// TODO: automate `key` and `event` defaults. 
// v-model internally uses different properties and emits different events for different input elements:
//     text and textarea elements use value property and input event;
//     checkboxes and radiobuttons use checked property and change event;
//     select fields use value as a prop and change as an event.
export function model<ValueType = string, EventType extends ListenableSupportedType = 'input'> (
  { target, value }: ModelRequired<ValueType>,
  options: ModelOptions<ValueType, EventType> = {}
): void {
  const { key, event, toValue } = { ...defaultOptions, ...options } as ModelOptions<ValueType, EventType>

  bind({
    target,
    keys: {
      [key]: defineBindValue<ValueType>(value)
    }
  })
  
  on<EventType>({
    target,
    effects: defineEffect => [
      defineEffect(
        event,
        (event => value.value = toValue(event)) as ListenEffect<EventType>
      )
    ]
  })
}
