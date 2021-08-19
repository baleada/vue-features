import { watch, onMounted } from 'vue'
import type { WatchSource } from 'vue'

/**
 * Schedule a side effect to run once after the component is mounted, then flush the side effect 'post' after any watch source change.
 * Truly the magic that glues this entire system together.
 */
export function schedule ({ effect, watchSources }: { effect: () => any, watchSources: WatchSource[] }) {
  onMounted(() => {
    effect()
    watch(
      watchSources,
      () => effect(),
      { flush: 'post' }
    )
  })
}
