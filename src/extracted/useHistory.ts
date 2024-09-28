import { watch, type ShallowReactive } from 'vue'
import { type Navigateable } from '@baleada/logic'
import { useNavigateable } from '@baleada/vue-composition'

export type History<Entry> = {
  entries: ShallowReactive<Navigateable<Entry>>,
  rewrite: (rewritten: Entry[]) => void,
  record: (entry: Entry) => void,
  undo: (options?: { distance?: number }) => void,
  redo: (options?: { distance?: number }) => void,
}

export function useHistory<Entry> (): History<Entry> {
  const entries: History<Entry>['entries'] = useNavigateable<Entry>([]),
        rewrite: History<Entry>['rewrite'] = rewritten => {
          entries.array = rewritten
        },
        record: History<Entry>['record'] = entry => {
          rewrite([...entries.array, entry])
        },
        undo: History<Entry>['undo'] = (options = {}) => {
          entries.previous({ loops: false, ...options })
        },
        redo: History<Entry>['redo'] = (options = {}) => {
          entries.next({ loops: false, ...options })
        }

  watch (
    () => entries.array,
    () => entries.navigate(entries.array.length - 1)
  )

  return {
    entries,
    rewrite,
    record,
    undo,
    redo,
  }
}
