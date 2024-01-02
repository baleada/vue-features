import { ref } from 'vue'
import type { Ref } from 'vue'
import { useDelayable } from '@baleada/vue-composition'
import { createResults } from '@baleada/logic'
import type { PlaneApi } from './usePlaneApi'
import type { Plane } from './plane'

export function usePlaneQuery<Meta extends { candidate: string }> (
  { api }: {
    api: PlaneApi<HTMLElement, true, Meta>,
  }
): {
  query: Ref<string>,
  results: Ref<
    ReturnType<
      ReturnType<
        typeof createResults<{ row: number, column: number, candidate: string }, true>
      >
    >
  >,
  type: (character: string, options?: { eventuallyClears?: boolean }) => void,
  paste: (string: string, options?: { eventuallyClears?: boolean }) => void,
  search: () => void,
} {
  const query: ReturnType<typeof usePlaneQuery>['query'] = ref(''),
        eventuallyClear = useDelayable(() => query.value = '', { delay: 500 }),
        type: ReturnType<typeof usePlaneQuery>['type'] = (character, options = { eventuallyClears: true }) => {
          if (eventuallyClear.status === 'delaying') {
            eventuallyClear.stop()
          }

          query.value += character

          if (options.eventuallyClears) {
            eventuallyClear.delay()
          }
        },
        paste: ReturnType<typeof usePlaneQuery>['paste'] = (string, options = { eventuallyClears: true }) => {
          if (eventuallyClear.status === 'delaying') {
            eventuallyClear.stop()
          }

          query.value = string

          if (options.eventuallyClears) {
            eventuallyClear.delay()
          }
        },
        results = ref<ReturnType<typeof usePlaneQuery>['results']['value']>([]),
        search: ReturnType<typeof usePlaneQuery>['search'] = () => {
          const candidates = toCandidates(api.meta.value)

          results.value = createResults(candidates, ({ sortKind }) => ({
            returnMatchData: true,
            threshold: 0,
            sortBy: sortKind.insertOrder,
            keySelector: ({ candidate }) => candidate,
          }))(query.value)
        },
        toCandidates = (meta: Plane<Meta>) => {
          const candidates: { row: number, column: number, candidate: string }[] = []
          
          for (let row = 0; row < meta.length; row++) {
            for (let column = 0; column < meta[0].length; column++) {
              candidates.push({
                row,
                column,
                candidate: meta[row][column].candidate || api.plane.value[row][column].textContent,
              })
            }
          }
          
          return candidates
        }

  return { query, results, type, paste, search }
}
