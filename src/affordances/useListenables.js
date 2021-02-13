import { onMounted, watch } from 'vue'
import { useListenable } from '@baleada/vue-composition'
import { ensureTargets } from '../util'

export default function useListenables ({ target: rawTargets, listenables: rawListenables }) {
  const targets = ensureTargets(rawTargets),
        listenables = Object.entries(rawListenables).map(([type, rawListenParams]) => {
          const { targetClosure, options } = ensureListenParams(rawListenParams)
          
          return {
            instance: useListenable(type, options?.listenable),
            listenParams: { targetClosure, options: options?.listen }
          }
        }),
        effect = () => {
          listenables.forEach(({ instance, listenParams: { targetClosure, options } }) => {
            instance.value.stop()
            
            targets.value.forEach((target, index) => {
              if (!target) {
                return
              }

              if (!instance.value.activeListeners.find(({ target: t }) => t === target)) {
                instance.value.listen(
                  event => targetClosure({ target, index, listenable: instance })(event),
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
