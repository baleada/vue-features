import { shallowRef, ref, computed, inject, watch, onMounted, onScopeDispose } from 'vue'
import type { ComputedRef } from 'vue'
import { createHover, createKeys, createOmit } from '@baleada/logic'
import type {
  HoverOptions,
  HoverMetadata,
} from '@baleada/logic'
import { pipe, toLength } from 'lazy-collections'
import { defineRecognizeableEffect, on as scopedOn } from '../affordances'
import { narrowElement, HoverInjectionKey } from '../extracted'
import type { ExtendableElement } from '../extracted'
import { supportedOptions } from '../extracted/delegateHover'

export type Hover = {
  status: ComputedRef<'hovered' | 'exited'>
  is: {
    hovered: () => boolean,
    exited: () => boolean,
  }
  descriptor: ComputedRef<HoverDescriptor>,
  firstDescriptor: ComputedRef<HoverDescriptor>,
}

export type HoverDescriptor = {
  metadata: HoverMetadata,
  sequence: (MouseEvent | TouchEvent)[],
}

export type UseHoverOptions = HoverOptions

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
      ...defineRecognizeableEffect(element, 'hover', {
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
          listenable: { recognizeable: { effects: createHover(withStatusEffect) } },
          listen: { addEventListener:{ passive: true } },
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
