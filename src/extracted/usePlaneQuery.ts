import { ref } from 'vue'
import type { Ref } from 'vue'
import { useDelayable, useSearchable } from '@baleada/vue-composition'
import { sortKind } from 'fast-fuzzy' 
import type { Searchable } from '@baleada/logic'
import type { IdentifiedPlaneApi } from './useElementApi'
import type { Plane } from './narrowReactivePlane'

export function usePlaneQuery<Meta extends { candidate: string }> (
  { plane }: {
    plane: IdentifiedPlaneApi<HTMLElement, Meta>,
  }
): {
  query: Ref<string>,
  searchable: Ref<Searchable<{ row: number, column: number, candidate: string }>>,
  type: (character: string, options?: { eventuallyClears?: boolean }) => void,
  paste: (string: string, options?: { eventuallyClears?: boolean }) => void,
  search: () => void,
} {
  const query: ReturnType<typeof usePlaneQuery>['query'] = ref(''),
        eventuallyClear = useDelayable(() => query.value = '', { delay: 500 }),
        type: ReturnType<typeof usePlaneQuery>['type'] = (character, options = { eventuallyClears: true }) => {
          if (eventuallyClear.value.status === 'delaying') {
            eventuallyClear.value.stop()
          }

          query.value += character

          if (options.eventuallyClears) {
            eventuallyClear.value.delay()
          }
        },
        paste: ReturnType<typeof usePlaneQuery>['paste'] = (string, options = { eventuallyClears: true }) => {
          if (eventuallyClear.value.status === 'delaying') {
            eventuallyClear.value.stop()
          }

          query.value = string

          if (options.eventuallyClears) {
            eventuallyClear.value.delay()
          }
        },
        searchable: ReturnType<typeof usePlaneQuery>['searchable'] = useSearchable<{ row: number, column: number, candidate: string }>(
          [],
          { keySelector: ({ candidate }) => candidate }
        ),
        search: ReturnType<typeof usePlaneQuery>['search'] = () => {
          searchable.value.candidates = toCandidates(plane.meta.value)
          searchable.value.search(query.value, { returnMatchData: true, threshold: 0, sortBy: sortKind.insertOrder })
        },
        toCandidates = (meta: Plane<Meta>) => {
          const candidates: { row: number, column: number, candidate: string }[] = []
          
          for (let row = 0; row < meta.length; row++) {
            for (let column = 0; column < meta[0].length; column++) {
              candidates.push({
                row,
                column,
                candidate: meta[row][column].candidate || plane.elements.value[row][column].textContent,
              })
            }
          }
          
          return candidates
        }

  return { query, searchable, type, paste, search }
}
