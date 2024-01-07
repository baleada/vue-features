import { shallowRef } from 'vue'
import type { Ref } from 'vue'
import { createResults } from '@baleada/logic'
import { on } from '../affordances'
import type { PlaneApi } from './usePlaneApi'
import { Plane } from './plane'
import { useQuery } from './useQuery'
import type { ElementApi } from './useElementApi'
import type { UsePlaneFeaturesConfig } from './usePlaneFeatures'
import { predicateCmd, predicateCtrl, predicateSpace } from './predicateKeycombo'

export function usePlaneQuery<Meta extends { candidate?: string }> (
  { rootApi, planeApi, transfersFocus }: {
    rootApi: ElementApi<HTMLElement, true>,
    planeApi: PlaneApi<HTMLElement, true, Meta>,
    transfersFocus: UsePlaneFeaturesConfig['transfersFocus'],
  }
): {
  query: Ref<string>,
  results: Ref<Plane<ReturnType<ReturnType<typeof createResults<string, true>>>[number]>>,
  type: (character: string, options?: { eventuallyClears?: boolean }) => void,
  paste: (string: string, options?: { eventuallyClears?: boolean }) => void,
  search: () => void,
} {
  const { query, type, paste } = useQuery(),
        results = shallowRef<ReturnType<typeof usePlaneQuery>['results']['value']>([]),
        search: ReturnType<typeof usePlaneQuery>['search'] = () => {
          const candidates = toCandidates(planeApi.meta.value)

          const matchData = createResults(candidates, ({ sortKind }) => ({
            returnMatchData: true,
            threshold: 0,
            sortBy: sortKind.insertOrder,
            keySelector: ({ candidate }) => candidate,
          }))(query.value)

          const newResults: typeof results['value'] = new Plane()

          for (const { item: { row, column, candidate }, ...matchDatum } of matchData) {
            (newResults[row] || (newResults[row] = []))[column] = {
              ...matchDatum,
              item: candidate,
            }
          }

          results.value = newResults
        },
        toCandidates = (meta: Plane<Meta>) => {
          const candidates: { row: number, column: number, candidate: string }[] = []
          
          for (let row = 0; row < meta.length; row++) {
            for (let column = 0; column < meta[0].length; column++) {
              candidates.push({
                row,
                column,
                candidate: meta[row][column].candidate || planeApi.plane.value[row][column].textContent,
              })
            }
          }
          
          return candidates
        }

  if (transfersFocus) {
    on(
      rootApi.element,
      {
        keydown: event => {
          if (
            event.key.length > 1
            || predicateCtrl(event)
            || predicateCmd(event)
          ) return

          event.preventDefault()

          if (query.value.length === 0 && predicateSpace(event)) return
          
          type(event.key)
          search()
        },
      }
    )
  }

  return { query, results, type, paste, search }
}
