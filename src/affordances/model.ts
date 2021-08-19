import { ListenableSupportedType, ListenEffect, ListenEffectParam } from '@baleada/logic'
import type { Ref } from 'vue'
import type { BindTarget } from '../util'
import { bind } from './bind'
import { on } from './on'

export type ModelOptions<Value, EventType extends ListenableSupportedType> = {
  key?: string,
  event?: EventType,
  toValue?: (event: ListenEffectParam<EventType>) => Value,
}

const defaultOptions: ModelOptions<string, 'input'> = {
  key: 'value',
  event: 'input',
  toValue: event => (event.target as HTMLInputElement).value
}

// TODO: Keep an eye out for v-model inside v-for use cases
//
// GOAL: automate `key` and `event` defaults. 
// v-model internally uses different properties and emits different events for different input elements:
//     text and textarea elements use value property and input event;
//     checkboxes and radiobuttons use checked property and change event;
//     select fields use value as a prop and change as an event.
export function model<Value extends string | number | boolean = string, EventType extends ListenableSupportedType = 'input'> (
  { element, value }: {
    element: BindTarget,
    value: Ref<Value>,
  },
  options: ModelOptions<Value, EventType> = {}
): void {
  const { key, event, toValue } = { ...defaultOptions, ...options } as ModelOptions<Value, EventType>

  bind({
    element,
    values: {
      [key]: value,
    }
  })
  
  on<EventType>({
    element,
    effects: defineEffect => [
      defineEffect(
        event,
        (event => value.value = toValue(event)) as ListenEffect<EventType>
      )
    ]
  })
}
