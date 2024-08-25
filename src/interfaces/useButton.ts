import { ref, computed, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { createOmit } from '@baleada/logic'
import { bind } from '../affordances'
import { useWithPress } from '../extensions'
import type { WithPress, UseWithPressOptions } from '../extensions'
import {
  useElementApi,
  toLabelBindValues,
  defaultLabelMeta,
  defaultAbilityMeta,
  useWithAbility,
} from '../extracted'
import type {
  AbilityMeta,
  ElementApi,
  LabelMeta,
  WithAbility,
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
          & WithPress['is']
          & WithAbility['is']
          & {
            on: () => boolean,
            off: () => boolean,
          }
        ),
      }
      : {}
  )

type ButtonBase = Omit<WithPress, 'status'> & {
  root: ElementApi<HTMLButtonElement, true, LabelMeta & AbilityMeta>,
  pressStatus: WithPress['status'],
}

type ToggleButtonStatus = 'on' | 'off'

export type UseButtonOptions<Toggles extends boolean = false> = {
  toggles?: Toggles,
  initialStatus?: ToggleButtonStatus,
  withPress?: UseWithPressOptions,
}

const defaultOptions: UseButtonOptions<false> = {
  toggles: false,
  initialStatus: 'off',
  withPress: {},
}

export function useButton<Toggles extends boolean = false> (options: UseButtonOptions<Toggles> = {}): Button<Toggles> {
  // OPTIONS
  const {
    toggles,
    initialStatus,
    withPress: withPressOptions,
  } = { ...defaultOptions, ...options } as UseButtonOptions<Toggles>


  // ELEMENTS
  const root: Button<true>['root'] = useElementApi({
    identifies: true,
    defaultMeta: { ...defaultLabelMeta, ...defaultAbilityMeta },
  })


  // PRESSING
  const withPress = useWithPress(root.element, withPressOptions)


  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: 'button',
      ...toLabelBindValues(root),
    }
  )


  if (!toggles) {
    // API
    return {
      root,
      pressStatus: withPress.status,
      ...createOmit<WithPress, 'status'>(['status'])(withPress),
    } as unknown as Button<Toggles>
  }


  // ABILITY
  const withAbility = useWithAbility(root)


  // STATUS
  const status = ref(initialStatus),
        toggle = () => status.value = status.value === 'on'
          ? 'off'
          : 'on',
        toggleOn = () => status.value = 'on',
        toggleOff = () => status.value = 'off'

  watch(
    withPress.press,
    (current, previous) => {
      if (current.sequence[0] === previous?.sequence[0]) return
      toggle()
    }
  )

  bind(
    root.element,
    { ariaPressed: computed(() => `${status.value === 'on'}`) }
  )


  // API
  return {
    ...withPress,
    root,
    status: computed(() => status.value),
    toggle,
    on: toggleOn,
    off: toggleOff,
    is: {
      ...withPress.is,
      ...withAbility.is,
      on: () => status.value === 'on',
      off: () => status.value === 'off',
    },
    pressStatus: withPress.status,
  } as unknown as Button<Toggles>
}
