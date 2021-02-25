import schedule from '../util/schedule.js'

export default function bindAttribute ({ target, attribute: rawAttribute, value, watchSources }, options) {
  const attribute = ensureAttribute(rawAttribute)

  schedule(
    {
      target,
      effect: ({ target, value }) => {
        if (target.getAttribute(attribute) === value) {
          return
        }

        target.setAttribute(attribute, value)
      },
      value,
      watchSources,
    },
    options
  )
}

function ensureAttribute (rawAttribute) {
  switch (rawAttribute) {
    case 'for':
      return 'htmlFor'
    default:
      return /^(aria|data)[A-Z]/.test(rawAttribute)
        ? `${rawAttribute.slice(0, 4)}-${rawAttribute.slice(4).toLowerCase()}`
        : rawAttribute
  }
}

