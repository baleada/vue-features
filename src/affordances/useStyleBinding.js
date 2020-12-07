import { isRef, onMounted, watchEffect } from 'vue'
import { catchWithNextTick } from '../util'

export default function useStyleBinding ({ target, property, value }) {
  if (isRef(value)) {
    onMounted(() => {
      watchEffect(() => catchWithNextTick(() => (target.value.style[property] = value.value)))
    })
  } else {
    onMounted(() => catchWithNextTick(() => (target.value.style[property] = value)))
  }
}
