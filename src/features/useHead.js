import { ref, computed, isRef, watch, onMounted } from 'vue'
import { useBindings } from '../affordances'

export default function useHead ({
  title: rawTitle,
  metas = [],
}) {
  const title = ensureRef(rawTitle),
        metaEls = ref([])

  onMounted(() => {
    if (title.value) {
      // natively creates <title> tag automatically if head doesn't have one
      const effect = () => document.title = title.value
      effect()
      watch(title, effect)
    }

    metas.forEach((_, index) => {
      const el = document.createElement('meta')
      document.head.appendChild(el)
      metaEls.value[index] = el
    })
  })

  metas.forEach((meta, index) => {
    useBindings({
      target: computed(() => metaEls.value[index]),
      bindings: meta,
    })
  })
}

function ensureRef (value) {
  return isRef(value) ? value : ref(value)
}
