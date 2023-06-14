import { ListenableSupportedType, ListenEffectParam } from '@baleada/logic'
import type { Ref } from 'vue'
import type { BindElement } from '../extracted'
import { bind } from './bind'
import { on } from './on'
import type { OnEffect } from './on'

export type ModelOptions<Value extends string | number | boolean, EventType extends ListenableSupportedType> = {
  key?: string,
  event?: EventType,
  toValue?: (event: ListenEffectParam<EventType>) => Value,
}

const defaultOptions: ModelOptions<string, 'input'> = {
  key: 'value',
  event: 'input',
  toValue: event => (event.target as HTMLInputElement).value
}

export const checkboxOptions: ModelOptions<boolean, 'change'> = {
  key: 'checked',
  event: 'change',
  toValue: event => (event.target as HTMLInputElement).checked
}

export const radioOptions = checkboxOptions

export const selectOptions: ModelOptions<string, 'change'> = {
  key: 'value',
  event: 'change',
  toValue: event => (event.target as HTMLInputElement).value
}

// TODO: Keep an eye out for v-model inside v-for use cases
export function model<Value extends string | number | boolean = string, EventType extends ListenableSupportedType = 'input'> (
  element: BindElement,
  modelValue: Ref<Value>,
  options: ModelOptions<Value, EventType> = {}
): void {
  const { key, event, toValue } = { ...defaultOptions, ...options } as ModelOptions<Value, EventType>

  bind(
    element,
    { [key]: modelValue }
  )
  
  on(
    element,
    {
      [event]: e => modelValue.value = toValue(e)
    } as unknown as { [type in EventType]: OnEffect<typeof element, EventType> }
  )
}
