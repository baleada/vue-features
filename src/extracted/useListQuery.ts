import { ref } from 'vue'
import type { Ref } from 'vue'
import { useDelayable } from '@baleada/vue-composition'
import { createMap, createResults } from '@baleada/logic'
import type { IdentifiedListApi } from './useElementApi'

export function useListQuery<Meta extends { candidate: string }> (
  { list }: {
    list: IdentifiedListApi<HTMLElement, Meta>,
  }
): {
  query: Ref<string>,
  results: Ref<ReturnType<ReturnType<typeof createResults<string, true>>>>,
  type: (character: string, options?: { eventuallyClears?: boolean }) => void,
  paste: (string: string, options?: { eventuallyClears?: boolean }) => void,
  search: () => void,
} {
  const query: ReturnType<typeof useListQuery>['query'] = ref(''),
        eventuallyClear = useDelayable(() => query.value = '', { delay: 500 }),
        type: ReturnType<typeof useListQuery>['type'] = (character, options = { eventuallyClears: true }) => {
          if (eventuallyClear.status === 'delaying') {
            eventuallyClear.stop()
          }

          query.value += character

          if (options.eventuallyClears) {
            eventuallyClear.delay()
          }
        },
        paste: ReturnType<typeof useListQuery>['paste'] = (string, options = { eventuallyClears: true }) => {
          if (eventuallyClear.status === 'delaying') {
            eventuallyClear.stop()
          }

          query.value = string

          if (options.eventuallyClears) {
            eventuallyClear.delay()
          }
        },
        results = ref<ReturnType<typeof useListQuery>['results']['value']>([]),
        search: ReturnType<typeof useListQuery>['search'] = () => {
          const candidates = toCandidates(list.meta.value)
          results.value = createResults(
            candidates,
            ({ sortKind }) => ({
              returnMatchData: true,
              threshold: 0,
              sortBy: sortKind.insertOrder,
            })
          )(query.value)
        },
        toCandidates = createMap<Meta, string>(({ candidate }, index) => candidate || list.elements.value[index].textContent)

  return { query, results, type, paste, search }
}
