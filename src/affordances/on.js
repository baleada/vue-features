import { onMounted, watch } from 'vue'
import { useListenable } from '@baleada/vue-composition'
import { ensureTargets } from '../util'

// TODO: Support modifiers: https://v3.vuejs.org/api/directives.html#v-on
// Not all are necessary, as Listenable solves a lot of those problems.
// .once might be worth supporting.
export function on ({ target: rawTargets, events: rawEvents }) {
  const targets = ensureTargets(rawTargets),
        events = Object.entries(rawEvents).map(([type, rawListenParams]) => {
          const { targetClosure, options } = ensureListenParams(rawListenParams)
          
          return {
            listenable: useListenable(options?.type || type, options?.listenable),
            listenParams: { targetClosure, options: options?.listen }
          }
        }),
        effect = () => {
          events.forEach(({ listenable, listenParams: { targetClosure, options } }) => {            
            targets.value.forEach((target, index) => {
              if (!target) {
                return
              }

              listenable.value.stop({ target }) // Gotta clean up closures around potentially stale target indices.

              const off = () => {
                listenable.value.stop({ target })
              }

              listenable.value.listen(
                e => targetClosure({ target, index, off, listenable })(e), // Listenable instance is particularly useful for accessing Recognizeable metadata
                { ...options, target }
              )
            })
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

  // useListenable cleans up side effects automatically
}

function ensureListenParams (rawListenable) {
  return typeof rawListenable === 'function'
    ? { targetClosure: () => rawListenable }
    : {
        targetClosure: rawListenable?.targetClosure || (() => rawListenable.callback),
        options: rawListenable.options,
      }
}
