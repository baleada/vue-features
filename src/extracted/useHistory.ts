import { watch } from 'vue'
import type { Ref } from 'vue'
import type { Navigateable } from '@baleada/logic'
import { useNavigateable } from '@baleada/vue-composition'

export type History<Item> = {
  recorded: Ref<Navigateable<Item>>,
  record: (item: Item) => void,
  undo: () => void,
  redo: () => void,
}

export type UseHistoryOptions = {
  maxLength?: true | number,
}

const defaultOptions: UseHistoryOptions = {
  maxLength: true,
}

export function useHistory<Item> (options: UseHistoryOptions = {}) {
  const { maxLength } = { ...defaultOptions, ...options },
        recorded: History<Item>['recorded'] = useNavigateable<Item>([]),
        record: History<Item>['record'] = item => {
          if (maxLength === true || recorded.value.array.length < maxLength) {
            recorded.value.array = [...recorded.value.array , item]
            return
          }
          
          recorded.value.array = [...recorded.value.array.slice(1), item]
        },
        undo: History<Item>['undo'] = () => {
          recorded.value.previous({ loops: false })
        },
        redo: History<Item>['redo'] = () => {
          recorded.value.next({ loops: false })
        }

  watch (
    () => recorded.value.array,
    () => recorded.value.navigate(recorded.value.array.length - 1)
  )

  return {
    recorded,
    record,
    undo,
    redo,
  }
}
