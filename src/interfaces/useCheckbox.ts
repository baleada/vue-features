import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { model } from '../affordances'
import { useElementApi } from '../extracted'
import type { SingleIdentifiedElementApi } from '../extracted'

export type Checkbox = {
  root: SingleIdentifiedElementApi<HTMLInputElement>,
  checked: ComputedRef<boolean>,
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
  const root = useElementApi<HTMLInputElement, false, true>({ identified: true })


  // CHECKED
  const checked = ref(initialChecked),
        check = () => checked.value = true,
        uncheck = () => checked.value = false

  
  // BASIC BINDINGS
  model(
    root.element,
    checked,
    { toValue: event => (event.target as HTMLInputElement).checked }
  )


  // API
  return {
    root,
    checked: computed(() => checked.value),
    check,
    uncheck,
    is: {
      checked: () => checked.value,
      unchecked: () => !checked.value,
    }
  }
}
