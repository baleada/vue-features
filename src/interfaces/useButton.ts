import { ref, computed, watch, type ComputedRef } from 'vue'
import { createOmit } from '@baleada/logic'
import { bind } from '../affordances'
import {
  usePress,
  type Press,
  type UsePressOptions,
} from '../extensions'
import {
  useElementApi,
  toLabelBindValues,
  defaultLabelMeta,
  defaultAbilityMeta,
  useAbility,
  type AbilityMeta,
  type ElementApi,
  type LabelMeta,
  type UsedAbility,
  type SupportedElement,
} from '../extracted'

export type Button<Toggles extends boolean = false> = ButtonBase
  & (
    Toggles extends true
      ? {
        status: ComputedRef<ToggleButtonStatus>,
        toggle: () => ToggleButtonStatus,
        on: () => ToggleButtonStatus,
        off: () => ToggleButtonStatus,
        is: (
          & ButtonBase['is']
          & {
            on: () => boolean,
            off: () => boolean,
          }
        ),
      }
      : {}
  )

type ButtonBase = Omit<Press, 'status' | 'descriptor' | 'firstDescriptor'> & {
  root: ElementApi<SupportedElement, true, LabelMeta & AbilityMeta>,
  pressDescriptor: Press['descriptor'],
  firstPressDescriptor: Press['firstDescriptor'],
  pressStatus: Press['status'],
  is: (
    & Press['is']
    & UsedAbility['is']
  ),
}

type ToggleButtonStatus = 'on' | 'off'

export type UseButtonOptions<Toggles extends boolean = false> = {
  toggles?: Toggles,
  initialStatus?: ToggleButtonStatus,
  press?: UsePressOptions,
}

const defaultOptions: UseButtonOptions<false> = {
  toggles: false,
  initialStatus: 'off',
  press: {},
}

export function useButton<Toggles extends boolean = false> (options: UseButtonOptions<Toggles> = {}): Button<Toggles> {
  // OPTIONS
  const {
    toggles,
    initialStatus,
    press: pressOptions,
  } = { ...defaultOptions, ...options } as UseButtonOptions<Toggles>


  // ELEMENTS
  const root: Button<true>['root'] = useElementApi({
    identifies: true,
    defaultMeta: { ...defaultLabelMeta, ...defaultAbilityMeta },
  })


  // PRESS
  const press = usePress(root.element, pressOptions)


  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: 'button',
      ...toLabelBindValues(root),
    }
  )


  // ABILITY
  const withAbility = useAbility(root)


  if (!toggles) {
    // API
    return {
      root,
      pressDescriptor: press.descriptor,
      firstPressDescriptor: press.firstDescriptor,
      is: {
        ...press.is,
        ...withAbility.is,
      },
      pressStatus: press.status,
      ...createOmit<Press, 'status' | 'descriptor' | 'firstDescriptor'>(
        ['status', 'descriptor', 'firstDescriptor']
      )(press),
    } as unknown as Button<Toggles>
  }


  // STATUS
  const status = ref(initialStatus),
        toggle = () => status.value = status.value === 'on'
          ? 'off'
          : 'on',
        toggleOn = () => status.value = 'on',
        toggleOff = () => status.value = 'off'

  watch(press.firstDescriptor, toggle)

  bind(
    root.element,
    { ariaPressed: computed(() => `${status.value === 'on'}`) }
  )


  // API
  return {
    root,
    status: computed(() => status.value),
    toggle,
    on: toggleOn,
    off: toggleOff,
    is: {
      ...press.is,
      ...withAbility.is,
      on: () => status.value === 'on',
      off: () => status.value === 'off',
    },
    pressDescriptor: press.descriptor,
    firstPressDescriptor: press.firstDescriptor,
    pressStatus: press.status,
    ...createOmit<Press, 'status' | 'descriptor' | 'firstDescriptor'>(
      ['status', 'descriptor', 'firstDescriptor']
    )(press),
  } as unknown as Button<Toggles>
}
