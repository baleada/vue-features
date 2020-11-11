import { nextTick } from 'vue'
import useAttributeBinding from './useAttributeBinding'
import useListBinding from './useListBinding'
import useStyleBinding from './useStyleBinding'

const listRE = /^(?:class|rel)$/,
      styleRE = /^style\.(\w+)$/

export default function useBindings ({ target, bindings }) {
  for (let binding in bindings) {
    const type = (
            (listRE.test(binding) && 'list') ||
            (styleRE.test(binding) && 'style') ||
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
  const { 1: property } = binding.match(styleRE)
  return property
}
