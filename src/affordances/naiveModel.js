import bindAttribute from './bindAttribute.js'
import on from './naiveOn.js'

const defaultOptions = {
  attribute: 'value',
  event: 'input',
  toValue: ({ target: { value } }) => value
}

export default function naiveModel ({ target, value }, options = {}) {
  const { attribute, event, toValue } = { ...defaultOptions, ...options }

  bindAttribute({
    target,
    attribute,
    value,
  })
  
  on({
    target,
    events: { [event]: event => value.value = toValue(event) }
  })
}
