import { onMounted } from 'vue'
import { useListenable } from '@baleada/vue-composition'
import { catchWithNextTick } from '../util'

export default function useListenables ({ target, listeners }) {
  Object.entries(listeners).forEach(([eventType, rawListenParams]) => {
    const listenable = useListenable(eventType),
          { listener, options } = ensureListenParams(rawListenParams)

    onMounted(() => {
      catchWithNextTick(() => {
        assertTarget(target)
        listenable.value.listen(listener, { ...options, target: target.value })
      })
    })

    // useListenable automatically stops listening onBeforeUnmounted
  })
}

function ensureListenParams (rawListenParams) {
  return typeof rawListenParams === 'function'
    ? { listener: rawListenParams, options: {} }
    : rawListenParams
}

function assertTarget (target) {
  if (target.value === null) {
    throw new Error('target is not yet available in the DOM')
  }
}
