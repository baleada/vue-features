import useBindings from './useBindings.js'
import useListeners from './useListeners.js'

const defaultOptions = {
  attribute: 'value',
  event: 'input',
  toValue: ({ target: { value } }) => value
}

// TODO: Keep an eye out for v-model inside v-for use cases
export default function useModel ({ target, value }, options = {}) {
  const { attribute, event, toValue } = { ...defaultOptions, ...options }

  useBindings({
    target,
    bindings: { [attribute]: value }
  })
  
  useListeners({
    target,
    listeners: { [event]: event => value.value = toValue(event) }
  })
}
