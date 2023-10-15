import { ref, computed, watch } from 'vue'
import type { ComputedRef } from 'vue'
import { bind, on } from '../affordances'
import {
  useElementApi,
  predicateUp,
  predicateRight,
  predicateDown,
  predicateLeft,
  predicateEnter,
  toLabelBindValues,
  defaultLabelMeta,
} from '../extracted'
import type { IdentifiedElementApi, LabelMeta } from '../extracted'

export type Separator<Kind extends SeparatorKind = 'static'> = (
  Kind extends 'static'
    ? {
      root: IdentifiedElementApi<HTMLElement>,
    }
    : (
      {
        root: IdentifiedElementApi<
          HTMLElement,
          LabelMeta & { controls: string }
        >,
        position: ComputedRef<number>,
        exact: (position: number) => void,
        toggle: () => void,
      } & (
        Kind extends 'variable'
          ? {
            increase: () => void,
            decrease: () => void,
            toggle: () => void,
          }
          : Record<never, never>
      )
    )
)

type SeparatorKind = 'static' | 'variable' | 'fixed'

export type UseSeparatorOptions<Kind extends SeparatorKind = 'static'> = {
  orientation?: 'horizontal' | 'vertical',
  kind?: Kind,
} & (
  Kind extends 'static'
    ? Record<never, never>
    : (
      {
        initialPosition?: number,
        min?: number,
        max?: number,
        controls?: string,
        label?: string,
        labelledby?: string,
      } & (
        Kind extends 'fixed'
          ? Record<never, never>
          : {
            step?: number,
          }
      )
    )
)

const defaultOptions: UseSeparatorOptions<'static'> = {
  orientation: 'horizontal',
  kind: 'static',
  // @ts-expect-error
  initialPosition: 50,
  min: 0,
  max: 100,
  step: 1,
  controls: '',
}

export function useSeparator<Kind extends SeparatorKind = 'static'> (
  options: UseSeparatorOptions<Kind> = {} as UseSeparatorOptions<Kind>
): Separator<Kind> {
  // OPTIONS
  const withDefaults = { ...defaultOptions, ...options },
        { orientation, kind } = withDefaults


  if (kind === 'static') {
    // ELEMENTS
    const root: Separator['root'] = useElementApi({ identifies: true })    


    // BASIC BINDINGS
    bind(
      root.element,
      {
        role: 'separator',
        ariaOrientation: orientation,
      }
    )


    // API
    return {
      root,
    } as Separator<Kind>
  }


  // OPTIONS
  const {
    initialPosition,
    min,
    max,
    controls,
  } = withDefaults as unknown as UseSeparatorOptions<'variable'>

  
  // ELEMENTS
  const root: Separator<'variable'>['root'] = useElementApi({
    identifies: true,
    defaultMeta: {
      controls,
      ...defaultLabelMeta,
    },
  })


  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: 'separator',
      tabIndex: 0,
      ariaOrientation: orientation,
      ariaControls: () => root.meta.value.controls || undefined,
      ...toLabelBindValues(root),
    }
  )


  // POSITION
  const position = ref(initialPosition),
        exact: Separator<'variable'>['exact'] = (newPosition: number) => {
          position.value = newPosition
        },
        toggle: Separator<'variable'>['toggle'] = () => {
          if (position.value !== min) {
            position.value = min
            return
          }

          position.value = previousPosition
        },
        maybeToggle = (event: KeyboardEvent) => {
          if (predicateEnter(event)) {
            toggle()
            return true
          }

          return false
        }
  
  let previousPosition = min

  watch(
    position,
    () => {
      if (position.value === min) return
      previousPosition = position.value
    },
    { immediate: true }
  )

  bind(
    root.element,
    {
      ariaValuenow: position,
      ariaValuemin: min,
      ariaValuemax: max,
    }
  )

  if (kind === 'fixed') {    
    on(
      root.element,
      { keydown: maybeToggle }
    )


    // API
    return {
      root,
      position: computed(() => position.value),
      exact,
      toggle,
    } as Separator<Kind>
  }

  
  // OPTIONS
  const { step } = withDefaults as unknown as UseSeparatorOptions<'variable'>


  // POSITION
  const increase: Separator<'variable'>['increase'] = () => exact(Math.min(position.value + step, max)),
        decrease: Separator<'variable'>['decrease'] = () => exact(Math.max(position.value - step, min))

  switch (orientation) {
    case 'horizontal':
      on(
        root.element,
        {
          keydown: event => {
            if (predicateLeft(event)) {
              decrease()
              return
            }

            if (predicateRight(event)) {
              increase()
              return
            }
            
            maybeToggle(event)
          },
        }
      )
      break
    case 'vertical':
      on(
        root.element,
        {
          keydown: event => {
            if (predicateUp(event)) {
              decrease()
              return
            }

            if (predicateDown(event)) {
              increase()
              return
            }
            
            maybeToggle(event)
          },
        }
      )
      break
  }


  // API
  return {
    root,
    position: computed(() => position.value),
    exact,
    increase,
    decrease,
  } as Separator<Kind>
}
