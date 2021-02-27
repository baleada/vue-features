import { onMounted, watch } from 'vue'
import { useListenable } from '@baleada/vue-composition'
import { ensureTargets } from '../util'

// TODO: Support modifiers: https://v3.vuejs.org/api/directives.html#v-on
// Not all are necessary, as Listenable solves a lot of those problems.
// .once might be worth supporting.
export default function on ({ target: rawTargets, events: rawEvents }) {
  const targets = ensureTargets(rawTargets),
        events = Object.entries(rawEvents).map(([type, rawListenParams]) => {
          const { targetClosure, options } = ensureListenParams(rawListenParams)
          
          return {
            listenable: useListenable(type, options?.listenable),
            listenParams: { targetClosure, options: options?.listen }
          }
        }),
        effect = () => {
          events.forEach(({ listenable, listenParams: { targetClosure, options } }) => {            
            targets.value.forEach((target, index) => {
              if (!target) {
                return
              }

              if (![...listenable.value.active].find(({ target: t }) => t === target)) {
                listenable.value.listen(
                  // I don't have a compelling use case to expose the listenable here, but it's possible
                  e => targetClosure({ target, index, /* listenable */ })(e),
                  { ...options, target }
                )
              }
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
