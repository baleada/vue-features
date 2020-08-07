import useAttributeBinding from './useAttributeBinding'
import useListBinding from './useListBinding'
import useStyleBinding from './useStyleBinding'

const listRegexp = /^(?:class|rel)$/,
      styleRegexp = /^style\.(\w+)$/

export default function useBinding ({ target, attribute, value }) {
  const type = (
          (listRegexp.test(attribute) && 'list') ||
          (styleRegexp.test(attribute) && 'style') ||
          'attribute'
        )

  switch (type) {
  case 'list':
    useListBinding({ target, list: attribute, value })
    break
  case 'style':
    useStyleBinding({ target, property: getProperty(attribute), value })
    break
  case 'attribute':
    useAttributeBinding({ target, attribute, value })
    break
  }
}

function getProperty (attribute) {
  const { 1: property } = attribute.match(styleRegexp)
  return property
}