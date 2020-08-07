import { isRef, onMounted, watchEffect } from 'vue'

export default function useAttributeBinding ({ target, attribute, value }) {
  attribute = getActual(attribute)

  if (isRef(value)) {
    watchEffect(() => (target.value[attribute] = value.value))
  } else {
    onMounted(() => (target.value[attribute] = value))
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