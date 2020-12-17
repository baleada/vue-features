import { isRef, onMounted, watchEffect } from 'vue'
import { catchWithNextTick } from '../util'

export default function useStyleBinding ({ target, property, value }, options) {
  if (isRef(value)) {
    onMounted(() => {
      watchEffect(() => catchWithNextTick(() => (target.value.style[property] = value.value), options))
    })
  } else {
    onMounted(() => catchWithNextTick(() => (target.value.style[property] = value), options))
  }
}
