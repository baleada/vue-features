import { onMounted, onBeforeUnmount, watch } from 'vue'
import { ensureTargets } from '../util'

export default function naiveOn ({ target: rawTargets, events: rawEvents }) {
  const targets = ensureTargets(rawTargets),
        events = Object.entries(rawEvents).map(([type, rawListener]) => ({ type, listener: ensureListener(rawListener) })),
        handledEvents = new Set(),
        effect = () => {
          events.forEach((event, eventIndex) => {
            targets.value.forEach((target, targetIndex) => {
              if (!target) {
                return
              }

              const { type, listener: { targetClosure, options } } = event,
                    callback = e => targetClosure({ target, index: targetIndex })(e)

              if (!handledEvents.has({ target, targetIndex, eventIndex, type, callback, options })) {
                target.addEventListener(type, callback, options)
                handledEvents.add({ target, targetIndex, eventIndex, type, callback, options })
              }
            })
          })
        },
        cleanup = () => {
          handledEvents.forEach(handledEvent => remove(handledEvent))
        },
        remove = handledEvent => {
          const { target, type, callback, options } = handledEvent
          target.removeEventListener(type, callback, options)
          handledEvents.delete(handledEvent)
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
