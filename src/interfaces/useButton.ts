import { ref, computed, watch, type ComputedRef } from 'vue'
import { createOmit } from '@baleada/logic'
import { bind } from '../affordances'
import {
  usePress,
  type Press,
  type UsePressOptions,
} from '../extensions'
import {
  defaultLabelMeta,
  defaultAbilityMeta,
  useAbility,
  type AbilityMeta,
  type ElementApi,
  type LabelMeta,
  type UsedAbility,
  type SupportedElement,
} from '../extracted'
import { useSemantic } from './useSemantic'

export type Button<Toggles extends boolean = false> = ButtonBase
  & (
    Toggles extends true
      ? {
        status: ComputedRef<ButtonToggleStatus>,
        toggle: () => ButtonToggleStatus,
        on: () => ButtonToggleStatus,
        off: () => ButtonToggleStatus,
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

export type ButtonToggleStatus = 'on' | 'off'

export type UseButtonOptions<Toggles extends boolean = false> = (
  & {
    toggles?: Toggles,
    press?: UsePressOptions,
  }
  & (
    Toggles extends true
      ? { initialStatus?: ButtonToggleStatus }
      : Record<never, never>
  )
)

const defaultOptions = {
  toggles: false,
  initialStatus: 'off',
  press: {},
} as UseButtonOptions<false>

export function useButton<Toggles extends boolean = false> (options: UseButtonOptions<Toggles> = {}): Button<Toggles> {
  // OPTIONS
  const {
    toggles,
    initialStatus,
    press: pressOptions,
  } = { ...defaultOptions, ...options } as UseButtonOptions<true>


  // ELEMENTS
  const { root }: Pick<Button<true>, 'root'> = useSemantic({
    role: 'button',
    defaultMeta: {
      ...defaultLabelMeta,
      ...defaultAbilityMeta,
    },
  })


  // PRESS
  const press = usePress(root.element, pressOptions)


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
      ...createOmit<Press, 'status' | 'descriptor' | 'firstDescriptor' | 'is'>(
        ['status', 'descriptor', 'firstDescriptor', 'is']
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
    ...createOmit<Press, 'status' | 'descriptor' | 'firstDescriptor' | 'is'>(
      ['status', 'descriptor', 'firstDescriptor', 'is']
    )(press),
  } as unknown as Button<Toggles>
}
