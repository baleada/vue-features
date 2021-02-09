import { onMounted, watch } from 'vue'
import { useListenable } from '@baleada/vue-composition'
import { ensureTargets } from '../util'

export default function useListenables ({ target: rawTargets, listenables: rawListenables }) {
  const targets = ensureTargets(rawTargets),
        listenables = Object.entries(rawListenables).map(([type, rawListenParams]) => ({ instance: useListenable(type), listenParams: ensureListenParams(rawListenParams) })),
        effect = () => {
          listenables.forEach(({ instance, listenParams: { targetClosure, options } }) => {
            instance.value.stop()
            
            targets.value.forEach((target, index) => {
              if (!target) {
                return
              }

              if (!instance.value.activeListeners.find(({ target: t }) => t === target)) {
                instance.value.listen(
                  event => targetClosure({ target, index })(event),
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

    console.log(targets.value[0])
    console.log(listenables.map(({instance}) => instance.value.activeListeners))
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
