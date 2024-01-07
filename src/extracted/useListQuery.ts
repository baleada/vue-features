import { shallowRef, watch } from 'vue'
import type { Ref } from 'vue'
import { createMap, createResults } from '@baleada/logic'
import { on } from '../affordances'
import type { ElementApi } from './useElementApi'
import type { ListApi } from './useListApi'
import { useQuery } from './useQuery'
import type { ListFeatures, UseListFeaturesConfig } from './useListFeatures'
import { predicateCtrl, predicateCmd, predicateSpace } from './predicateKeycombo'
import type { ToListEligibility } from './createToEligibleInList'

export type UseListQueryConfig<Meta extends { candidate?: string }> = {
  rootApi: ElementApi<HTMLElement, true>,
  listApi: ListApi<HTMLElement, true, Meta>,
  queryMatchThreshold: number,
  transfersFocus: UseListFeaturesConfig['transfersFocus'],
  loops: UseListFeaturesConfig['loops'],
  focus: ListFeatures['focus'],
  focused: ListFeatures['focused'],
}

export function useListQuery<Meta extends { candidate?: string }> (
  {
    rootApi,
    listApi,
    transfersFocus,
    loops,
    queryMatchThreshold,
    focus,
    focused,
  }: UseListQueryConfig<Meta>
): {
  query: Ref<string>,
  results: Ref<ReturnType<ReturnType<typeof createResults<string, true>>>>,
  type: (character: string, options?: { eventuallyClears?: boolean }) => void,
  paste: (string: string, options?: { eventuallyClears?: boolean }) => void,
  search: () => void,
} {
  const { query, type, paste } = useQuery(),
        results = shallowRef<ReturnType<typeof useListQuery>['results']['value']>([]),
        search: ReturnType<typeof useListQuery>['search'] = () => {
          const candidates = toCandidates(listApi.meta.value)
          results.value = createResults(
            candidates,
            ({ sortKind }) => ({
              returnMatchData: true,
              threshold: 0,
              sortBy: sortKind.insertOrder,
            })
          )(query.value)
        },
        toCandidates = createMap<Meta, string>(({ candidate }, index) => candidate || listApi.list.value[index].textContent),
        toEligibility: ToListEligibility = index => {
          if (results.value.length === 0) return 'ineligible'

          return results.value[index].score >= queryMatchThreshold
            ? 'eligible'
            : 'ineligible'
        }

  if (transfersFocus) {
    watch(
      results,
      () => {
        const ability = focus.next(focused.location - 1, { toEligibility })
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
