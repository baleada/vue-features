import bindAttributeOrProperty from './bindAttributeOrProperty.js'
import on from './naiveOn.js'

const defaultOptions = {
  key: 'value',
  event: 'input',
  toValue: ({ target: { value } }) => value
}

export default function naiveModel ({ target, value }, options = {}) {
  const { key, event, toValue } = { ...defaultOptions, ...options }

  bindAttributeOrProperty({
    target,
    key,
    value,
  })
  
  on({
    target,
    events: { [event]: event => value.value = toValue(event) }
  })
}
