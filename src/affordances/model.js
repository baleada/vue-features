import bind from './bind.js'
import on from './on.js'

const defaultOptions = {
  key: 'value',
  event: 'input',
  toValue: ({ target: { value } }) => value
}

// TODO: Keep an eye out for v-model inside v-for use cases

// TODO: Based on target tag name, default to different key and event
export default function model ({ target, value }, options = {}) {
  const { key, event, toValue } = { ...defaultOptions, ...options }

  bind({
    target,
    keys: { [key]: value }
  })
  
  on({
    target,
    events: { [event]: event => value.value = toValue(event) }
  })
}
