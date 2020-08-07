import { isRef, onMounted, watchEffect } from 'vue'

export default function useListBinding ({ target, list, value }) {
  const cached = isRef(value) ? value.value : value

  if (isRef(value)) {
    watchEffect(() => {
      target.value[`${list}List`].remove(...toArray(cached))
      target.value[`${list}List`].add(...toArray(value.value))
      cached = value.value
    })
  } else {
    onMounted(() => target.value[`${list}List`].add(...toArray(value)))
  }
}

function toArray (value) {
  return value.split(' ')
}