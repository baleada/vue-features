import { ref, type Ref } from 'vue'
import { useDelayable } from '@baleada/vue-composition'

export type Query = {
  query: Ref<string>,
  type: (character: string, options?: { eventuallyClears?: boolean }) => void,
  paste: (string: string, options?: { eventuallyClears?: boolean }) => void,
}

export type UseQueryOptions = {
  clearDelay?: number,
}

const defaultOptions: UseQueryOptions = {
  clearDelay: 500,
}

export function useQuery (options: UseQueryOptions = {}): Query {
  const { clearDelay }  = { ...defaultOptions, ...options },
        query: ReturnType<typeof useQuery>['query'] = ref(''),
        eventuallyClear = useDelayable(() => query.value = '', { delay: clearDelay }),
        type: ReturnType<typeof useQuery>['type'] = (character, options = { eventuallyClears: true }) => {
          paste(`${query.value}${character}`, options)
        },
        paste: ReturnType<typeof useQuery>['paste'] = (string, options = { eventuallyClears: true }) => {
          if (eventuallyClear.status === 'delaying') eventuallyClear.stop()

          query.value = string

          const { eventuallyClears } = options
          if (eventuallyClears) eventuallyClear.delay()
        }

  return { query, type, paste }
}
