import schedule from '../util/schedule.js'

export default function bindKey ({ target, key: rawKey, value, watchSources }, options) {
  const key = ensureKey(rawKey)

  schedule(
    {
      target,
      effect: ({ target, value }) => {
        if (shouldSetAsProperty({ target, key, value })) {
          propertyEffect({ target, property: key, value })
        } else {
          attributeEffect({ target, attribute: key, value })
        }
      },
      value,
      watchSources,
    },
    options
  )
}

function ensureKey (rawKey) {
  switch (rawKey) {
    case 'for':
      return 'htmlFor'
    default:
      return /^(aria|data)[A-Z]/.test(rawKey)
        ? `${rawKey.slice(0, 4)}-${rawKey.slice(4).toLowerCase()}`
        : rawKey
  }
}

// Adapted from https://github.com/vuejs/vue-next/blob/5d825f318f1c3467dd530e43b09040d9f8793cce/packages/runtime-dom/src/patchProp.ts
function shouldSetAsProperty ({ target, key, value }) {
  if (key === 'spellcheck' || key === 'draggable') {
    return false
  }

  // The `form` attribute must be a string, while the `form` property accepts an Element
  if (key === 'form' && typeof value === 'string') {
    return false
  }

  // <input list> must be set as key
  if (key === 'list' && target.tagName === 'INPUT') {
    return false
  }
  
  // <input list> must be set as key
  if (key === 'list' && target.tagName === 'INPUT') {
    return false
  }

  return key in target
}

// Adapted from https://github.com/vuejs/vue-next/blob/354966204e1116bd805d65a643109b13bca18185/packages/runtime-dom/src/modules/props.ts
function propertyEffect({ target, property, value }) {
  // No special handling for innerHTML or textContent. They're outside the scope of Baleada Features.

  if (property === 'value' && target.tagName !== 'PROGRESS') {
    const ensuredValue = value == null ? '' : value
    
    if (target.value === ensuredValue) {
      return
    }

    target.value = ensuredValue
    return
  }

  if (value === '' || value == null) {
    const type = typeof target[property]

    switch (type) {
      case 'boolean': 
        if (value === '') {
          target[property] = true
          return
        }
        break
      case 'string': 
        if (value == null) {
          // e.g. <div :id="null">
          target[property] = ''
          target.removeAttribute(property)
          return
        }
        break
      case 'number': 
        // e.g. <img :width="null">
        target[property] = 0
        target.removeAttribute(property)
        return
    }
  }

  // Some properties perform value validation and throw.
  // Those errors are not caught here.
  target[property] = value
}

// Adapted from https://github.com/vuejs/vue-next/blob/5d825f318f1c3467dd530e43b09040d9f8793cce/packages/runtime-dom/src/modules/attrs.ts
function attributeEffect({ target, attribute, value }) {
  if (target.getAttribute(attribute) === value) {
    return
  }

  target.setAttribute(attribute, value)
}
