import { useBinding } from '../util'

export default function useAttributeBinding ({ target, attribute: rawAttribute, value, watchSources }, options) {
  const attribute = ensureAttribute(rawAttribute)

  useBinding(
    {
      target,
      bind: ({ target, value }) => {
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
      return /^aria[A-Z]/.test(rawAttribute)
        ? `aria-${rawAttribute.slice('aria'.length).toLowerCase()}`
        : rawAttribute
  }
}

