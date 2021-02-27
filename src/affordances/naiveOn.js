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

              cleanup({ target, type }) // Gotta clean up closures around potentially stale target indices.

              target.addEventListener(type, callback, options)
              handledEvents.add({ target, targetIndex, eventIndex, type, callback, options })
            })
          })
        },
        cleanup = (options = {}) => {
          const { target, type } = options

          if (target) {
            const handledEvent = [...handledEvents].find(({ target: ta, type: ty }) => ta === target && ty === type)

            if (handledEvent) {
              remove(handledEvent)
            }

            return
          }

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
