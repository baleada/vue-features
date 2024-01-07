import { shallowRef, watch } from 'vue'
import type { Ref } from 'vue'
import { createResults } from '@baleada/logic'
import { on } from '../affordances'
import type { PlaneApi } from './usePlaneApi'
import { Plane } from './plane'
import { useQuery } from './useQuery'
import type { ElementApi } from './useElementApi'
import type { PlaneFeatures, UsePlaneFeaturesConfig } from './usePlaneFeatures'
import { predicateCmd, predicateCtrl, predicateSpace } from './predicateKeycombo'
import type { ToPlaneEligibility } from './createToEligibleInPlane'

export type UseListQueryConfig<Meta extends { candidate?: string }> = {
  rootApi: ElementApi<HTMLElement, true>,
  planeApi: PlaneApi<HTMLElement, true, Meta>,
  queryMatchThreshold: number,
  transfersFocus: UsePlaneFeaturesConfig['transfersFocus'],
  loops: UsePlaneFeaturesConfig['loops'],
  focus: PlaneFeatures['focus'],
  focusedRow: PlaneFeatures['focusedRow'],
  focusedColumn: PlaneFeatures['focusedColumn'],
}

export function usePlaneQuery<Meta extends { candidate?: string }> (
  {
    rootApi,
    planeApi,
    transfersFocus,
    queryMatchThreshold,
    loops,
    focus,
    focusedRow,
    focusedColumn,
  }: UseListQueryConfig<Meta>
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
        },
        toEligibility: ToPlaneEligibility = ([row, column]) => {
          if (results.value.length === 0) return 'ineligible'

          return results.value[row][column].score >= queryMatchThreshold
            ? 'eligible'
            : 'ineligible'
        }

  if (transfersFocus) {
    watch(
      results,
      () => {
        const ability = focus.nextInRow([focusedRow.location, focusedColumn.location - 1], { toEligibility })
        if (ability === 'none' && !loops) focus.first({ toEligibility })
      }
    )

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
