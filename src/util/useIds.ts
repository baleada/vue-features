import { ref, computed, onMounted, watch } from 'vue'
import type { Ref, WatchSource } from 'vue'
import { nanoid } from 'nanoid'
import { ensureTargetsRef, Target } from './ensureTargetsRef'
import { ensureWatchSources } from './ensureWatchSources'

export function useSingleId ({ target, watchSources }: {
  target: Element | Ref<Element>,
  watchSources?: WatchSource | WatchSource[],
}) {
  const ids = useIds({ target, watchSources })
  return computed(() => ids.value[0])
}

export function useMultipleIds ({ target, watchSources }: {
  target: Element[] | Ref<Element[]>,
  watchSources?: WatchSource | WatchSource[],
}) {
  const ids = useIds({ target, watchSources })
  return computed(() => ids.value)
}

function useIds ({ target: rawTargets, watchSources: rawWatchSources }: {
  target: Target,
  watchSources?: WatchSource | WatchSource[],
}) {
  const ids = ref<string[]>([]),
        targets = ensureTargetsRef(rawTargets),
        watchSources = ensureWatchSources(rawWatchSources),
        nanoids = new WeakMap<Element, string>(),
        effect = () => {
          ids.value = targets.value.map(target => {
            if (!target) {
              return
            }

            if (!nanoids.get(target)) {
              nanoids.set(target, nanoid())
            }

            return !!target.id ? target.id : nanoids.get(target)
          })
        }
  
  onMounted(() => {
    effect()
    watch(
      [() => targets.value, ...watchSources],
      () => effect(),
      { flush: 'post' }
    )
  })

  return ids
}
