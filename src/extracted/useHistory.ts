import { watch } from 'vue'
import { useNavigateable } from '@baleada/vue-composition'

export type History<Entry> = {
  entries: ReturnType<typeof useNavigateable<Entry>>,
  rewrite: (rewritten: Entry[]) => void,
  record: (entry: Entry) => void,
  undo: (options?: { distance?: number }) => void,
  redo: (options?: { distance?: number }) => void,
}

export function useHistory<Entry> (): History<Entry> {
  const entries: History<Entry>['entries'] = useNavigateable<Entry>([]),
        rewrite: History<Entry>['rewrite'] = rewritten => {
          entries.array = rewritten as typeof entries['array']
        },
        record: History<Entry>['record'] = entry => {
          rewrite([...entries.array as Entry[], entry])
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
