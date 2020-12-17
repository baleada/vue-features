import { isRef, onMounted, watchEffect } from 'vue'
import { catchWithNextTick } from '../util'

export default function useAttributeBinding ({ target, attribute: rawAttribute, value }, options) {
  const attribute = ensureAttribute(rawAttribute)
  
  if (isRef(value)) {
    onMounted(() => {
      watchEffect(() => catchWithNextTick(() => (target.value.setAttribute(attribute, value.value)), options))
    })
  } else {
    onMounted(() => catchWithNextTick(() => (target.value.setAttribute(attribute, value)), options))
  }
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
