import { nextTick, watch } from 'vue'
import type { ShallowReactive } from 'vue'
import type { Navigateable } from '@baleada/logic'
import { useNavigateable } from '@baleada/vue-composition'

export type History<Entry> = {
  entries: ShallowReactive<Navigateable<Entry>>,
  rewrite: (rewritten: Entry[]) => void,
  record: (entry: Entry) => void,
  undo: (options?: { distance?: number }) => void,
  redo: (options?: { distance?: number }) => void,
}

export type UseHistoryOptions = {
  maxLength?: true | number,
}

const defaultOptions: UseHistoryOptions = {
  maxLength: true,
}

export function useHistory<Entry> (options: UseHistoryOptions = {}): History<Entry> {
  let status: 'ready' | 'recorded' | 'undone' | 'redone' = 'ready'

  const { maxLength } = { ...defaultOptions, ...options },
        entries: History<Entry>['entries'] = useNavigateable<Entry>([]),
        rewrite = rewritten => {
          if (maxLength === true || rewritten.length < maxLength) {            
            entries.array = rewritten
            status = 'recorded'
            return
          }
          
          entries.array = rewritten.slice(rewritten.length - maxLength)
          status = 'recorded'
        },
        record: History<Entry>['record'] = entry => {
          if (maxLength === true || entries.array.length < maxLength) {            
            entries.array = [...entries.array , entry]
            status = 'recorded'
            return
          }
          
          entries.array = [...entries.array.slice(1), entry]
          status = 'recorded'
        },
        undo: History<Entry>['undo'] = (options = {}) => {
          if (status === 'recorded') {
            // Wait for entries array watch effect to navigate to new location
            // before undoing to previous location
            nextTick(() => entries.previous({ loops: false, ...options }))
            status = 'undone' 
            return
          }

          entries.previous({ loops: false, ...options })
          status = 'undone'
        },
        redo: History<Entry>['redo'] = (options = {}) => {
          entries.next({ loops: false, ...options })
          status = 'redone'
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
