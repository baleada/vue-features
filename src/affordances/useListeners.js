import { isRef, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { catchWithNextTick } from '../util'

export default function useListeners ({ target: rawTargets, listeners: rawListeners }) {
  const targets = ensureTargets(rawTargets),
        listeners = Object.entries(rawListeners).map(([eventType, rawListener]) => ({ eventType, listener: ensureListener(rawListener) })),
        activeListeners = [],
        effect = () => {
          listeners.forEach(({ eventType, listener: { targetClosure, options } }) => {
            targets.value.forEach((target, index) => {
              if (!activeListeners.includes(target)) {
                target.addEventListener(eventType, event => targetClosure({ target, index })(event), options)
                activeListeners.push(target)
              }
            })
          })
        },
        cleanup = () => {
          listeners.forEach(({ eventType, listener: { targetClosure, options } }) => {
            activeListeners.forEach((target, index) => target.removeEventListener(eventType, event => targetClosure({ target, index })(event), options))
          })
        }

  nextTick(() => effect())
  
  onMounted(() => {
    watch(
      [() => targets.value],
      () => catchWithNextTick(() => effect())
    )
  })

  onBeforeUnmount(() => cleanup())
}

function ensureListener (rawListener) {
  return typeof rawListener === 'function'
    ? { targetClosure: () => rawListener }
    : {
        targetClosure: rawListener?.targetClosure || (() => rawListener.callback),
        options: rawListener.options,
      }
}

function ensureTargets (rawTargets) {
  return isRef(rawTargets)
    ? Array.isArray(rawTargets.value)
      ? rawTargets
      : computed(() => [rawTargets.value])
    : Array.isArray(rawTargets)
      ? computed(() => rawTargets)
      : computed(() => [rawTargets])
}
