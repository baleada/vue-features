import { isRef, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { catchWithNextTick } from '../util'

export default function useListeners ({ target: rawTarget, listeners: rawListeners }) {
  const target = ensureTarget(rawTarget),
        listeners = Object.entries(rawListeners).map(([eventType, rawListener]) => ({ eventType, listener: ensureListener(rawListener) })),
        activeListeners = [],
        effect = () => {
          listeners.forEach(({ eventType, listener: { elementClosure, options } }) => {
            target.value.forEach((el, index) => {
              if (!activeListeners.includes(el)) {
                el.addEventListener(eventType, event => elementClosure({ el, index })(event), options)
                activeListeners.push(el)
              }
            })
          })
        },
        cleanup = () => {
          listeners.forEach(({ eventType, listener: { elementClosure, options } }) => {
            activeListeners.forEach((el, index) => el.removeEventListener(eventType, event => elementClosure({ el, index })(event), options))
          })
        }

  nextTick(() => effect())
  
  onMounted(() => {
    watch(
      [() => target.value],
      () => catchWithNextTick(() => effect())
    )
  })

  onBeforeUnmount(() => cleanup())
}

function ensureListener (rawListener) {
  const type = 
    (Array.isArray(rawListener) && 'array')
    ||
    (typeof rawListener === 'function' && 'function')
    ||
    'object'

  switch (type) {
    case 'array':
      return { elementClosure: rawListener[0], options: rawListener[1] }
    case 'function':
      return { elementClosure: () => rawListener }
    case 'object':
      return { elementClosure: () => rawListener.listener, options: rawListener.options }
  }
}

function ensureTarget (rawTarget) {
  return isRef(rawTarget)
    ? Array.isArray(rawTarget.value)
      ? rawTarget
      : computed(() => [rawTarget.value])
    : Array.isArray(rawTarget)
      ? computed(() => rawTarget)
      : computed(() => [rawTarget])
}
