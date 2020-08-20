import { isRef, onMounted, watchEffect } from 'vue'

export default function useAttributeBinding ({ target, attribute, value }) {
  attribute = getActual(attribute)

  if (isRef(value)) {
    onMounted(() => {
      watchEffect(() => (target.value.setAttribute(attribute, value.value)))
    })
  } else {
    onMounted(() => (target.value.setAttribute(attribute, value)))
  }
}

function getActual (attribute) {
  switch (attribute) {
  case 'for':
    return 'htmlFor'
  default:
    return attribute
  }
}
