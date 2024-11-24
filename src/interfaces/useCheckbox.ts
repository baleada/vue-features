import { ref, type Ref } from 'vue'
import {
  bind,
  model,
  checkboxModelOptions,
} from '../affordances'
import {
  useElementApi,
  toLabelBindValues,
  defaultLabelMeta,
  defaultAbilityMeta,
  defaultValidityMeta,
  useAbility,
  useValidity,
  type AbilityMeta,
  type ElementApi,
  type LabelMeta,
  type ValidityMeta,
  type UsedAbility,
  type UsedValidity,
} from '../extracted'

export type Checkbox = {
  root: ElementApi<HTMLInputElement, true, LabelMeta & AbilityMeta & ValidityMeta>,
  checked: Ref<boolean>,
  toggle: () => boolean,
  check: () => boolean,
  uncheck: () => boolean,
  is: (
    & UsedAbility['is']
    & UsedValidity['is']
    & {
      checked: () => boolean,
      unchecked: () => boolean,
    }
  ),
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
    toLabelBindValues(root),
  )

  model(root.element, checked, checkboxModelOptions)


  // ABILITY
  const withAbility = useAbility(root)


  // VALIDITY
  const withValidity = useValidity(root)


  // API
  return {
    root,
    checked,
    toggle,
    check,
    uncheck,
    is: {
      ...withAbility.is,
      ...withValidity.is,
      checked: () => checked.value,
      unchecked: () => !checked.value,
    },
  }
}
