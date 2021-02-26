import { onMounted, onBeforeUnmount, watch } from 'vue'
import { ensureTargets } from '../util'

export default function naiveOn ({ target: rawTargets, events: rawEvents }) {
  const targets = ensureTargets(rawTargets),
        events = Object.entries(rawEvents).map(([type, rawListener]) => ({ type, listener: ensureListener(rawListener) })),
        handled = [],
        effect = () => {
          events.forEach((event, eventIndex) => {
            targets.value.forEach((target, targetIndex) => {
              cleanup({ targetIndex, eventIndex })

              if (!target) {
                return
              }

              if (!handled.find(({ target: t, targetIndex: ti, eventIndex: ei }) => t === target && ti === targetIndex && ei === eventIndex)) {
                const { type, listener: { targetClosure, options } } = event,
                      callback = e => targetClosure({ target, index: targetIndex })(e)

                target.addEventListener(type, callback, options)

                handled.push({ target, targetIndex, eventIndex, type, callback, options })
              }
            })
          })
        },
        cleanup = (options = {}) => {
          const { targetIndex, eventIndex } = options,
                eventsToRemove = typeof targetIndex === 'number' && typeof eventIndex === 'number'
                  ? handled.filter(({ targetIndex: ti, eventIndex: ei }) => ti === targetIndex && ei === eventIndex)
                  : handled

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
