import { useBinding } from '../util'

export default function useAttributeBinding ({ target, attribute: rawAttribute, value }, options) {
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

