import { computed, unref } from 'vue'

export default function toEachable (total) {
  return computed(() => 
    (new Array(unref(total)))
      .fill()
      .map((_, index) => index)
  )
}
