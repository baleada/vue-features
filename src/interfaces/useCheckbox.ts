import { ref, watch, type Ref } from 'vue'
import { model, checkboxModelOptions } from '../affordances'
import {
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
import {
  usePress,
  type Press,
  type UsePressOptions,
} from '../extensions'
import { useSemantic } from './useSemantic'

export type Checkbox = {
  root: ElementApi<HTMLInputElement, true, LabelMeta & AbilityMeta & ValidityMeta>,
  checked: Ref<boolean>,
  toggle: () => boolean,
  check: () => boolean,
  uncheck: () => boolean,
  determinate: Ref<boolean>,
  pressDescriptor: Press['descriptor'],
  firstPressDescriptor: Press['firstDescriptor'],
  pressStatus: Press['status'],
  is: (
    & Press['is']
    & UsedAbility['is']
    & UsedValidity['is']
    & {
      checked: () => boolean,
      unchecked: () => boolean,
      determinate: () => boolean,
      indeterminate: () => boolean,
    }
  ),
}

export type UseCheckboxOptions = {
  initialChecked?: boolean,
  initialDeterminate?: boolean,
  press?: UsePressOptions,
}

const defaultOptions: UseCheckboxOptions = {
  initialChecked: false,
  initialDeterminate: true,
  press: {},
}

export function useCheckbox (options: UseCheckboxOptions = {}): Checkbox {
  // OPTIONS
  const {
    initialChecked,
    initialDeterminate,
    press: pressOptions,
  } = { ...defaultOptions, ...options }


  // ELEMENTS
  const { root }: Pick<Checkbox, 'root'> = useSemantic<HTMLInputElement>({
    role: 'checkbox',
    defaultMeta: {
      ...defaultLabelMeta,
      ...defaultAbilityMeta,
      ...defaultValidityMeta,
    },
  })


  // PRESS
  const press = usePress(root.element, pressOptions)


  // CHECKED
  const checked = ref(initialChecked),
        toggle = () => checked.value = !checked.value,
        check = () => checked.value = true,
        uncheck = () => checked.value = false

  watch(press.firstDescriptor, toggle)


  // BASIC BINDINGS
  model(root.element, checked, checkboxModelOptions)


  // ABILITY
  const withAbility = useAbility(root)


  // VALIDITY
  const withValidity = useValidity(root)


  // DETERMINACY
  const determinate = ref(initialDeterminate)


  // API
  return {
    root,
    checked,
    toggle,
    check,
    uncheck,
    determinate,
    pressDescriptor: press.descriptor,
    firstPressDescriptor: press.firstDescriptor,
    pressStatus: press.status,
    is: {
      ...withAbility.is,
      ...withValidity.is,
      ...press.is,
      checked: () => checked.value,
      unchecked: () => !checked.value,
      determinate: () => determinate.value,
      indeterminate: () => !determinate.value,
    },
  }
}
