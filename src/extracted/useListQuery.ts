import { shallowRef } from 'vue'
import type { Ref } from 'vue'
import { createMap, createResults } from '@baleada/logic'
import type { ListApi } from './useListApi'
import { useQuery } from './useQuery'

export function useListQuery<Meta extends { candidate: string }> (
  { api }: {
    api: ListApi<HTMLElement, true, Meta>,
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
          const candidates = toCandidates(api.meta.value)
          results.value = createResults(
            candidates,
            ({ sortKind }) => ({
              returnMatchData: true,
              threshold: 0,
              sortBy: sortKind.insertOrder,
            })
          )(query.value)
        },
        toCandidates = createMap<Meta, string>(({ candidate }, index) => candidate || api.list.value[index].textContent)

  return { query, results, type, paste, search }
}
