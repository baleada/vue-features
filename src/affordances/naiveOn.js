import { onMounted, onBeforeUnmount, watch } from 'vue'
import { ensureTargets } from '../util'

export default function naiveOn ({ target: rawTargets, events: rawEvents }) {
  const targets = ensureTargets(rawTargets),
        events = Object.entries(rawEvents).map(([type, rawListener]) => ({ type, listener: ensureListener(rawListener) })),
        activeListeners = [],
        effect = () => {
          events.forEach((event, eventIndex) => {
            cleanup(eventIndex)

            targets.value.forEach((target, index) => {
              if (!target) {
                return
              }

              if (!activeListeners.find(({ target: t, index: i, eventIndex: l }) => t === target && i === index && l === eventIndex)) {
                const { type, listener: { targetClosure, options } } = event,
                      callback = e => targetClosure({ target, index })(e)

                target.addEventListener(type, callback, options)

                activeListeners.push({ target, index, eventIndex, type, callback, options })
              }
            })
          })
        },
        cleanup = eventIndex => {
          const eventsToRemove = typeof eventIndex === 'number'
            ? activeListeners.filter(({ eventIndex: l }) => l === eventIndex)
            : activeListeners

          eventsToRemove.forEach(({ target, type, callback, options }) => {
            target.removeEventListener(type, callback, options)
          })
        }
  
  onMounted(() => {
    effect()
    watch(
      [() => targets.value],
      effect,
      { flush: 'post' }
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
