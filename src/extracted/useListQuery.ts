import { ref } from 'vue'
import type { Ref } from 'vue'
import { useDelayable, useSearchable } from '@baleada/vue-composition'
import { createMap } from '@baleada/logic'
import { sortKind } from 'fast-fuzzy' 
import type { Searchable } from '@baleada/logic'
import type { IdentifiedListApi } from './useElementApi'

export function useListQuery<Meta extends { candidate: string }> (
  { list }: {
    list: IdentifiedListApi<HTMLElement, Meta>,
  }
): {
  query: Ref<string>,
  searchable: Ref<Searchable<string>>,
  type: (character: string, options?: { eventuallyClears?: boolean }) => void,
  paste: (string: string, options?: { eventuallyClears?: boolean }) => void,
  search: () => void,
} {
  const query: ReturnType<typeof useListQuery>['query'] = ref(''),
        eventuallyClear = useDelayable(() => query.value = '', { delay: 500 }),
        type: ReturnType<typeof useListQuery>['type'] = (character, options = { eventuallyClears: true }) => {
          if (eventuallyClear.value.status === 'delaying') {
            eventuallyClear.value.stop()
          }

          query.value += character

          if (options.eventuallyClears) {
            eventuallyClear.value.delay()
          }
        },
        paste: ReturnType<typeof useListQuery>['paste'] = (string, options = { eventuallyClears: true }) => {
          if (eventuallyClear.value.status === 'delaying') {
            eventuallyClear.value.stop()
          }

          query.value = string

          if (options.eventuallyClears) {
            eventuallyClear.value.delay()
          }
        },
        searchable: ReturnType<typeof useListQuery>['searchable'] = useSearchable<string>([]),
        search: ReturnType<typeof useListQuery>['search'] = () => {
          searchable.value.candidates = toCandidates(list.meta.value)
          searchable.value.search(query.value, { returnMatchData: true, threshold: 0, sortBy: sortKind.insertOrder })
        },
        toCandidates = createMap<Meta, string>(({ candidate }, index) => candidate || list.elements.value[index].textContent)

  return { query, searchable, type, paste, search }
}
