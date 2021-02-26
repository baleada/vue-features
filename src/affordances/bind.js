import bindAttributeOrProperty from './bindAttributeOrProperty.js'
import bindList from './bindList.js'
import bindStyle from './bindStyle.js'

const listRE = /^(?:class|rel)$/,
      styleRE = /^style_(\w+)$/

export default function bind ({ target, attributes }, options) {
  Object.entries(attributes).forEach(([key, value]) => {
    const type = (
      (listRE.test(key) && 'list') ||
      (styleRE.test(key) && 'style') ||
      'attributeOrProperty'
    )

    switch (type) {
      case 'list':
        bindList({
          target,
          list: key,
          value: value.targetClosure ?? value,
          watchSources: value.watchSources 
        }, options)
        break
      case 'style':
        bindStyle({
          target,
          property: toStyleProperty(key),
          value: value.targetClosure ?? value,
          watchSources: value.watchSources 
        }, options)
        break
      case 'attributeOrProperty':
        bindAttributeOrProperty({
          target,
          key,
          value: value.targetClosure ?? value,
          watchSources: value.watchSources 
        }, options)
        break
    }
  })
}

function toStyleProperty (key) {
  const { 1: property } = key.match(styleRE)
  return property
}
