import useAttributeBinding from './useAttributeBinding'
import useListBinding from './useListBinding'
import useStyleBinding from './useStyleBinding'

const listRegexp = /^(?:class|rel)$/,
      styleRegexp = /^style\.(\w+)$/

export default function useBinding ({ target, bindings }) {
  for (let binding in bindings) {
    const type = (
            (listRegexp.test(binding) && 'list') ||
            (styleRegexp.test(binding) && 'style') ||
            'attribute'
          ),
          value = bindings[binding]

    switch (type) {
    case 'list':
      useListBinding({ target, list: binding, value })
      break
    case 'style':
      useStyleBinding({ target, property: getStyleProperty(binding), value })
      break
    case 'attribute':
      useAttributeBinding({ target, attribute: binding, value })
      break
    }
  }
}

function getStyleProperty (binding) {
  const { 1: property } = binding.match(styleRegexp)
  return property
}
