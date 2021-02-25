import bind from './bind.js'
import on from './on.js'

const defaultOptions = {
  attribute: 'value',
  event: 'input',
  toValue: ({ target: { value } }) => value
}

// TODO: Keep an eye out for v-model inside v-for use cases
export default function model ({ target, value }, options = {}) {
  const { attribute, event, toValue } = { ...defaultOptions, ...options }

  bind({
    target,
    attributes: { [attribute]: value }
  })
  
  on({
    target,
    events: { [event]: event => value.value = toValue(event) }
  })
}
