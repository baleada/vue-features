import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { model } from '../affordances'
import { useElementApi } from '../extracted'
import type { IdentifiedElementApi } from '../extracted'

export type Checkbox = {
  root: IdentifiedElementApi<HTMLInputElement>,
  checked: ComputedRef<boolean>,
  toggle: () => void,
  check: () => void,
  uncheck: () => void,
  is: {
    checked: () => boolean,
    unchecked: () => boolean,
  },
}

export type UseCheckboxOptions = {
  initialChecked?: boolean,
}

const defaultOptions: UseCheckboxOptions = {
  initialChecked: false
}

export function useCheckbox (options: UseCheckboxOptions = {}): Checkbox {
  // OPTIONS
  const {
    initialChecked,
  } = { ...defaultOptions, ...options }

  // ELEMENTS
  const root = useElementApi<HTMLInputElement, 'element', true>({ identified: true })


  // CHECKED
  const checked = ref(initialChecked),
        toggle = () => {
          checked.value = !checked.value
        },
        check = () => {
          checked.value = true
        },
        uncheck = () => {
          checked.value = false
        }

  
  // BASIC BINDINGS
  model(
    root.element,
    checked,
    { key: 'checked', toValue: event => (event.target as HTMLInputElement).checked }
  )


  // API
  return {
    root,
    checked: computed(() => checked.value),
    toggle,
    check,
    uncheck,
    is: {
      checked: () => checked.value,
      unchecked: () => !checked.value,
    }
  }
}
