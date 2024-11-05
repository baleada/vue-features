import {
  shallowRef,
  ref,
  computed,
  inject,
  watch,
  onMounted,
  onScopeDispose,
  type ComputedRef,
} from 'vue'
import {
  createPointerhover,
  createKeys,
  createOmit,
  type PointerhoverOptions,
  type PointerhoverMetadata,
} from '@baleada/logic'
import { pipe, toLength } from 'lazy-collections'
import {
  defineRecognizeableEffect,
  on as scopedOn,
} from '../affordances'
import {
  narrowElement,
  HoverInjectionKey,
  type ExtendableElement,
} from '../extracted'
import { supportedOptions } from '../extracted/delegateHover'

export type Hover = {
  status: ComputedRef<'hovered' | 'exited'>,
  is: {
    hovered: () => boolean,
    exited: () => boolean,
  },
  descriptor: ComputedRef<HoverDescriptor>,
  firstDescriptor: ComputedRef<HoverDescriptor>,
}

export type HoverDescriptor = {
  metadata: PointerhoverMetadata,
  sequence: (MouseEvent | TouchEvent)[],
}

export type UseHoverOptions = PointerhoverOptions

export function useHover (
  extendable: ExtendableElement,
  options: UseHoverOptions = {}
): Hover {
  const withStatusEffect: UseHoverOptions = {
    ...options,
    onOut: (...params) => {
      status.value = 'exited'
      options.onOut?.(...params)
    },
  }

  // ON
  const on = toCustomOptionsLength(options)
    ? scopedOn
    : inject(
      HoverInjectionKey,
      { createOn: () => scopedOn }
    )?.createOn?.({
      watch,
      onMounted,
      onScopeDispose,
      options: withStatusEffect,
    })


  // ELEMENTS
  const element = narrowElement(extendable)

  // MULTIPLE CONCERNS
  const status = ref<'hovered' | 'exited'>('exited'),
        descriptor = shallowRef<HoverDescriptor>(),
        firstDescriptor = shallowRef<HoverDescriptor>()

  on(
    element,
    // @ts-expect-error
    {
      ...defineRecognizeableEffect(element, 'pointerhover', {
        createEffect: ({ listenable }) => () => {
          status.value = 'hovered'
          descriptor.value = {
            metadata: listenable.recognizeable.metadata,
            sequence: listenable.recognizeable.sequence,
          }

          if (listenable.recognizeable.sequence[0] === firstDescriptor.value?.sequence[0]) return
          firstDescriptor.value = descriptor.value
        },
        options: {
          listenable: { recognizeable: { effects: createPointerhover(withStatusEffect) } },
        },
      }),
    }
  )

  return {
    status: computed(() => status.value),
    is: {
      hovered: () => status.value === 'hovered',
      exited: () => status.value === 'exited',
    },
    descriptor: computed(() => descriptor.value),
    firstDescriptor: computed(() => firstDescriptor.value),
  }
}

const toCustomOptionsLength = (options: UseHoverOptions) => pipe(
  () => options,
  createOmit<UseHoverOptions, typeof supportedOptions[number]>(supportedOptions),
  createKeys(),
  toLength(),
)()
