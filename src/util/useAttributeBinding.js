import { isRef, onMounted, watchEffect } from 'vue'
import catchWithNextTick from './catchWithNextTick'

export default function useAttributeBinding ({ target, attribute, value }) {
  attribute = getActual(attribute)
  
  if (isRef(value)) {
    onMounted(() => {
      watchEffect(() => catchWithNextTick(() => (target.value.setAttribute(attribute, value.value))))
    })
  } else {
    onMounted(() => catchWithNextTick(() => (target.value.setAttribute(attribute, value))))
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
