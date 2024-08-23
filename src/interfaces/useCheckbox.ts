import { ref, computed } from 'vue'
import type { ComputedRef } from 'vue'
import { bind, model, checkboxModelOptions } from '../affordances'
import {
  useElementApi,
  toLabelBindValues,
  defaultLabelMeta,
  defaultAbilityMeta,
  defaultValidityMeta,
  toAbilityBindValues ,
  toValidityBindValues,
} from '../extracted'
import type {
  AbilityMeta,
  ElementApi,
  LabelMeta,
  ValidityMeta,
} from '../extracted'

export type Checkbox = {
  root: ElementApi<HTMLInputElement, true, LabelMeta & AbilityMeta & ValidityMeta>,
  checked: ComputedRef<boolean>,
  toggle: () => boolean,
  check: () => boolean,
  uncheck: () => boolean,
  is: {
    checked: () => boolean,
    unchecked: () => boolean,
  },
}

export type UseCheckboxOptions = {
  initialChecked?: boolean,
}

const defaultOptions: UseCheckboxOptions = {
  initialChecked: false,
}

export function useCheckbox (options: UseCheckboxOptions = {}): Checkbox {
  // OPTIONS
  const {
    initialChecked,
  } = { ...defaultOptions, ...options }


  // ELEMENTS
  const root: Checkbox['root'] = useElementApi({
    identifies: true,
    defaultMeta: {
      ...defaultLabelMeta,
      ...defaultAbilityMeta,
      ...defaultValidityMeta,
    },
  })


  // CHECKED
  const checked = ref(initialChecked),
        toggle = () => checked.value = !checked.value,
        check = () => checked.value = true,
        uncheck = () => checked.value = false


  // BASIC BINDINGS
  bind(
    root.element,
    {
      ...toLabelBindValues(root),
      ...toAbilityBindValues(root),
      ...toValidityBindValues(root),
    }
  )
  model(root.element, checked, checkboxModelOptions)


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
    },
  }
}
