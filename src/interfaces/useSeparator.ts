import { ref, computed, watch, type ComputedRef } from 'vue'
import { createClamp } from '@baleada/logic'
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
  type ElementApi,
  type LabelMeta,
  type SupportedElement,
} from '../extracted'

export type Separator<Kind extends SeparatorKind = 'static'> = (
  Kind extends 'static'
    ? {
      root: ElementApi<SupportedElement, true>,
    }
    : (
      {
        root: ElementApi<
          SupportedElement,
          true,
          LabelMeta & { controls: string }
        >,
        position: ComputedRef<number>,
        exact: (position: number) => number,
        toggle: () => number,
      } & (
        Kind extends 'variable'
          ? {
            increase: () => number,
            decrease: () => number,
            toggle: () => number,
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
  } = withDefaults as unknown as UseSeparatorOptions<'variable'>


  // ELEMENTS
  const root: Separator<'variable'>['root'] = useElementApi({
    identifies: true,
    defaultMeta: {
      controls: '',
      ...defaultLabelMeta,
    },
  })


  // BASIC BINDINGS
  bind(
    root.element,
    {
      role: 'separator',
      ...toLabelBindValues(root),
      tabIndex: 0,
      ariaOrientation: orientation,
      ariaControls: computed(() => root.meta.value.controls || undefined),
    }
  )


  // POSITION
  const position = ref(initialPosition),
        toClamped = createClamp(min, max),
        exact: Separator<'variable'>['exact'] = newPosition => position.value = toClamped(newPosition),
        toggle: Separator<'variable'>['toggle'] = () =>
          position.value !== min
            ? exact(min)
            : exact(previousNonMinPosition),
        maybeToggle = (event: KeyboardEvent) => {
          if (predicateEnter(event)) toggle()
        }

  let previousNonMinPosition = initialPosition

  watch(
    position,
    () => {
      if (position.value === min) return
      previousNonMinPosition = position.value
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
  const increase: Separator<'variable'>['increase'] = () => exact(position.value + step),
        decrease: Separator<'variable'>['decrease'] = () => exact(position.value - step)

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
    toggle,
  } as Separator<Kind>
}
