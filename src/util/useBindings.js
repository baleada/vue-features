import useAttributeBinding from './useAttributeBinding'
import useListBinding from './useListBinding'
import useStyleBinding from './useStyleBinding'

const listRE = /^(?:class|rel)$/,
      styleRE = /^style_(\w+)$/

export default function useBindings ({ target, bindings }) {
  Object.entries(bindings).forEach(([binding, value]) => {
    const type = (
      (listRE.test(binding) && 'list') ||
      (styleRE.test(binding) && 'style') ||
      'attribute'
    )

    switch (type) {
      case 'list':
        useListBinding({ target, list: binding, value })
        break
      case 'style':
        useStyleBinding({ target, property: toStyleProperty(binding), value })
        break
      case 'attribute':
        useAttributeBinding({ target, attribute: binding, value })
        break
    }
  })
}

function toStyleProperty (binding) {
  const { 1: property } = binding.match(styleRE)
  return property
}
