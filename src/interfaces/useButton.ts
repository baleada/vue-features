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
} from '../extracted'
import type { ElementApi, LabelMeta } from '../extracted'

export type Button<Toggles extends boolean = false> = ButtonBase
  & (
    Toggles extends true
      ? {
        status: ComputedRef<ToggleButtonStatus>,
        toggle: () => void,
        on: () => void,
        off: () => void,
        is: WithPress['is'] & {
          on: () => boolean,
          off: () => boolean,
        },
      }
      : {}
  )

type ButtonBase = Omit<WithPress, 'status'> & {
  root: ElementApi<HTMLButtonElement, true, LabelMeta>,
  pressStatus: WithPress['status'],
}

type ToggleButtonStatus = 'on' | 'off'

export type UseButtonOptions<Toggles extends boolean = false> = {
  toggles?: Toggles,
  initialStatus?: ToggleButtonStatus,
  pressing?: UseWithPressOptions,
}

const defaultOptions: UseButtonOptions<false> = {
  toggles: false,
  initialStatus: 'off',
  pressing: {},
}

export function useButton<Toggles extends boolean = false> (options: UseButtonOptions<Toggles> = {}): Button<Toggles> {
  // OPTIONS
  const {
    toggles,
    initialStatus,
    pressing: pressingOptions,
  } = { ...defaultOptions, ...options } as UseButtonOptions<Toggles>


  // ELEMENTS
  const root: Button<true>['root'] = useElementApi({
    identifies: true,
    defaultMeta: defaultLabelMeta,
  })


  // PRESSING
  const withPress = useWithPress(root.element, pressingOptions)


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

  
  // STATUS
  const status = ref(initialStatus),
        toggle = () => {
          status.value = status.value === 'on' ? 'off' : 'on'
        },
        toggleOn = () => {
          status.value = 'on'
        },
        toggleOff = () => {
          status.value = 'off'
        }

  watch(withPress.release, toggle)

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
      on: () => status.value === 'on',
      off: () => status.value === 'off',
      ...withPress.is,
    },
    pressStatus: withPress.status,
  } as unknown as Button<Toggles>
}
