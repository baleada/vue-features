import bindAttribute from './bindAttribute.js'
import bindList from './bindList.js'
import bindStyle from './bindStyle.js'

const listRE = /^(?:class|rel)$/,
      styleRE = /^style_(\w+)$/

export default function bind ({ target, attributes }, options) {
  Object.entries(attributes).forEach(([attribute, value]) => {
    const type = (
      (listRE.test(attribute) && 'list') ||
      (styleRE.test(attribute) && 'style') ||
      'attribute'
    )

    switch (type) {
      case 'list':
        bindList({
          target,
          list: attribute,
          value: value.targetClosure ?? value,
          watchSources: value.watchSources 
        }, options)
        break
      case 'style':
        bindStyle({
          target,
          property: toStyleProperty(attribute),
          value: value.targetClosure ?? value,
          watchSources: value.watchSources 
        }, options)
        break
      case 'attribute':
        bindAttribute({
          target,
          attribute,
          value: value.targetClosure ?? value,
          watchSources: value.watchSources 
        }, options)
        break
    }
  })
}

function toStyleProperty (attribute) {
  const { 1: property } = attribute.match(styleRE)
  return property
}
