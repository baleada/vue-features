import { isRef, onMounted, watchEffect } from 'vue'
import { catchWithNextTick } from '../util'

export default function useListBinding ({ target, list, value }, options) {
  const cached = isRef(value) ? value.value : value

  if (isRef(value)) {
    onMounted(() => {
      watchEffect(() => catchWithNextTick(() => {
        target.value[`${list}List`].remove(...toArray(cached))
        target.value[`${list}List`].add(...toArray(value.value))
        cached = value.value
      }))
    })
  } else {
    onMounted(() => catchWithNextTick(() => target.value[`${list}List`].add(...toArray(value)), options))
  }
}

function toArray (value) {
  return value.split(' ')
}
