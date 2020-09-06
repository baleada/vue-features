import { isRef, onMounted, watchEffect } from 'vue'

export default function useStyleBinding ({ target, property, value }) {
  if (isRef(value)) {
    onMounted(() => {
      watchEffect(() => (target.value.style[property] = value.value))
    })
  } else {
    onMounted(() => (target.value.style[property] = value))
  }
}
