import type { WatchSource } from 'vue'
import { scheduleBind } from './scheduleBind'
import type { BindValue, BindTarget } from './scheduleBind'

export function bindAttributeOrProperty<ValueType extends string | number | boolean> ({ element, key, value, watchSources }: {
  element: BindTarget,
  key: string,
  value: BindValue<ValueType>,
  watchSources: WatchSource | WatchSource[],
}) {
  const ensuredKey = ensureKey(key)

  scheduleBind(
    {
      element,
      effect: ({ element, value }) => {
        if (shouldPerformPropertyEffect({ element, key: ensuredKey, value })) {
          propertyEffect({ element, property: ensuredKey, value })
        } else {
          attributeEffect({ element, attribute: ensuredKey, value })
        }
      },
      value,
      watchSources,
    }
  )
}

function ensureKey (rawKey: string): string {
  switch (rawKey) {
    case 'for':
      return 'htmlFor'
    case 'allowfullscreen':
      return 'allowFullscreen'
    case 'formnovalidate':
      return 'formNoValidate'
    case 'ismap':
      return 'isMap'
    case 'nomodule':
      return 'noModule'
    case 'novalidate':
      return 'noValidate'
    case 'readonly':
      return 'readOnly'
    default:
      return /^(aria|data)[A-Z]/.test(rawKey)
        ? `${rawKey.slice(0, 4)}-${rawKey.slice(4).toLowerCase()}`
        : rawKey
  }
}

// Adapted from https://github.com/vuejs/vue-next/blob/5d825f318f1c3467dd530e43b09040d9f8793cce/packages/runtime-dom/src/patchProp.ts
function shouldPerformPropertyEffect<ValueType extends string | number | boolean> ({ element, key, value }: {
  element: HTMLElement,
  key: string,
  value: ValueType,
}) {
  if (key === 'spellcheck' || key === 'draggable') {
    return false
  }

  // The `form` attribute must be a string, while the `form` property accepts an Element
  if (key === 'form' && typeof value === 'string') {
    return false
  }

  // <input list> must be set as key
  if (key === 'list' && element.tagName === 'INPUT') {
    return false
  }
  
  // <input list> must be set as key
  if (key === 'list' && element.tagName === 'INPUT') {
    return false
  }

  return key in element
}

// Adapted from https://github.com/vuejs/vue-next/blob/354966204e1116bd805d65a643109b13bca18185/packages/runtime-dom/src/modules/props.ts
function propertyEffect<ValueType extends string | number | boolean> ({ element, property, value }: {
  element: HTMLElement,
  property: string,
  value: ValueType,
}) {
  // No special handling for innerHTML or textContent. They're outside the scope of Baleada Features.

  if (property === 'value' && element.tagName !== 'PROGRESS') {
    const ensuredValue = value == null ? '' : value
    
    if ((element as HTMLInputElement).value === ensuredValue) {
      return
    }

    (element as HTMLInputElement).value = (ensuredValue as unknown as string) // It's possible to assign numbers, booleans, null, and undefined to el.value
    return
  }

  if ((typeof value === 'string' && value === '') || value == null) {
    const type = typeof element[property]

    switch (type) {
      case 'boolean': 
        if ((typeof value === 'string' && value === '')) {
          element[property] = true
          return
        }
        break
      case 'string': 
        if (value == null) {
          // e.g. <div :id="null">
          element[property] = ''
          element.removeAttribute(property)
          return
        }
        break
      case 'number': 
        // e.g. <img :width="null">
        element[property] = 0
        element.removeAttribute(property)
        return
    }
  }

  // Some properties perform value validation and throw.
  // Those errors are not caught here.
  element[property] = value
}

// Adapted from https://github.com/vuejs/vue-next/blob/5d825f318f1c3467dd530e43b09040d9f8793cce/packages/runtime-dom/src/modules/attrs.ts
const xlinkNS = 'http://www.w3.org/1999/xlink'
function attributeEffect<ValueType extends string | number | boolean> ({ element, attribute, value }: {
  element: HTMLElement,
  attribute: string,
  value: ValueType,
}) {
  if (element instanceof SVGElement && attribute.startsWith('xlink:')) {
    if (value == null) {
      element.removeAttributeNS(xlinkNS, attribute.slice(6, attribute.length))
    }
    
    element.setAttributeNS(xlinkNS, attribute, value as unknown as string)
    return
  }
  
  // Special boolean
  if (attribute === 'itemscope') {
    if (value == null || (typeof value === 'boolean' && value === false)) {
      element.removeAttribute(attribute)
      return
    }

    if (element.getAttribute(attribute) === '') {
      return
    }

    element.setAttribute(attribute, '')
    return
  }

  if (element.getAttribute(attribute) === (value as unknown as string)) {
    return
  }

  element.setAttribute(attribute, value as unknown as string)
}
