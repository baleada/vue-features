import { watch, onMounted } from 'vue'
import type { WatchSource } from 'vue'

/**
 * Schedule a side effect to run once after the component is mounted, then flush the side effect 'post' after any watch source change.
 * Truly the magic that glues this entire system together.
 */
export function schedule (
  { effect, watchSources, toEffectedStatus }: {
    effect: () => any,
    watchSources: WatchSource[],
    toEffectedStatus: (current: any, previous: any) => 'stale' | 'fresh',
  }
) {
  onMounted(() => {
    effect()
    watch(
      watchSources,
      (current, previous) => {
        if (toEffectedStatus(current, previous) === 'fresh') {
          return
        }

        effect()
      },
      { flush: 'post' }
    )
  })
}
