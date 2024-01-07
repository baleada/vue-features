import { shallowRef } from 'vue'
import type { Ref } from 'vue'
import { createMap, createResults } from '@baleada/logic'
import { on } from '../affordances'
import type { ElementApi } from './useElementApi'
import type { ListApi } from './useListApi'
import { useQuery } from './useQuery'
import type { UseListFeaturesConfig } from './useListFeatures'
import { predicateCtrl, predicateCmd, predicateSpace } from './predicateKeycombo'

export function useListQuery<Meta extends { candidate?: string }> (
  { rootApi, listApi, transfersFocus }: {
    rootApi: ElementApi<HTMLElement, true>,
    listApi: ListApi<HTMLElement, true, Meta>,
    transfersFocus: UseListFeaturesConfig['transfersFocus'],
  }
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
        toCandidates = createMap<Meta, string>(({ candidate }, index) => candidate || listApi.list.value[index].textContent)

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
