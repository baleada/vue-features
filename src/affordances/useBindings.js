import { isRef } from 'vue'

import useAttributeBinding from './useAttributeBinding'
import useListBinding from './useListBinding'
import useStyleBinding from './useStyleBinding'

const listRE = /^(?:class|rel)$/,
      styleRE = /^style_(\w+)$/

export default function useBindings ({ target, bindings }, options) {
  Object.entries(bindings).forEach(([binding, value]) => {
    const type = (
      (listRE.test(binding) && 'list') ||
      (styleRE.test(binding) && 'style') ||
      'attribute'
    )

    switch (type) {
      case 'list':
        useListBinding({
          target,
          list: binding,
          value: isRef(value) ? value : (value.value ?? value),
          watchSources: value.watchSources 
        }, options)
        break
      case 'style':
        useStyleBinding({
          target,
          property: toStyleProperty(binding),
          value: isRef(value) ? value : (value.value ?? value),
          watchSources: value.watchSources 
        }, options)
        break
      case 'attribute':
        useAttributeBinding({
          target,
          attribute: binding,
          value: isRef(value) ? value : (value.value ?? value),
          watchSources: value.watchSources 
        }, options)
        break
    }
  })
}

function toStyleProperty (binding) {
  const { 1: property } = binding.match(styleRE)
  return property
}
