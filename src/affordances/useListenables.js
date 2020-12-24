import { onMounted, nextTick, watch } from 'vue'
import { useListenable } from '@baleada/vue-composition'
import { catchWithNextTick, ensureTargets } from '../util'

export default function useListenables ({ target: rawTargets, listenables: rawListenables }) {
  const targets = ensureTargets(rawTargets),
        listenables = Object.entries(rawListenables).map(([type, rawListenParams]) => ({ instance: useListenable(type), listenParams: ensureListenParams(rawListenParams) })),
        effect = () => {
          listenables.forEach(({ instance, listenParams: { targetClosure, options } }) => {
            targets.value.forEach((target, index) => {
              if (!instance.value.activeListeners.find(({ target: t }) => t === target)) {
                instance.value.listen(
                  event => targetClosure({ target, index })(event),
                  { ...options, target }
                )
              }
            })
          })
        }

  nextTick(() => effect())

  onMounted(() => {
    watch(
      [() => targets.value],
      () => catchWithNextTick(() => effect())
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
