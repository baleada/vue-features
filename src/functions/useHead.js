import { ref, computed, isRef, watch, onMounted, onBeforeUnmount } from 'vue'
import { bind } from '../affordances'

export default function useHead ({
  title: rawTitle,
  metas = [],
}) {
  const title = ensureRef(rawTitle),
        cachedTitle = ref(),
        metaEls = ref([])

  onMounted(() => {
    if (title.value) {
      cachedTitle.value = document.title
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
    bind({
      target: computed(() => metaEls.value[index]),
      attributes: meta,
    })
  })

  onBeforeUnmount(() => {
    if (title.value) {
      document.title = cachedTitle.value
    }

    metaEls.value.forEach(el => document.head.removeChild(el))
  })
}

function ensureRef (value) {
  return isRef(value) ? value : ref(value)
}
