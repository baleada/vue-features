import { ref } from 'vue'
import type { Ref } from 'vue'
import { useDelayable } from '@baleada/vue-composition'

export type Query = {
  query: Ref<string>,
  type: (character: string, options?: { eventuallyClears?: boolean }) => void,
  paste: (string: string, options?: { eventuallyClears?: boolean }) => void,
}

export function useQuery (): Query {
  const query: ReturnType<typeof useQuery>['query'] = ref(''),
        eventuallyClear = useDelayable(() => query.value = '', { delay: 500 }),
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
