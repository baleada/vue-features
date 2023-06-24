import { ref, computed, inject, watch, onMounted, onBeforeUnmount } from 'vue'
import type { ComputedRef } from 'vue'
import { defineRecognizeableEffect, on as scopedOn } from '../affordances'
import { narrowElement, PressingInjectionKey } from '../extracted'
import type { ExtendableElement } from '../extracted'
import {
  createMousepress,
  createTouchpress,
  createKeypress,
  createMouserelease,
  createTouchrelease,
  createKeyrelease,
} from '@baleada/logic'
import type {
  MousepressOptions,
  TouchpressOptions,
  KeypressOptions,
  MousepressMetadata,
  TouchpressMetadata,
  KeypressMetadata,
  MousereleaseMetadata,
  TouchreleaseMetadata,
  KeyreleaseMetadata,
  KeyreleaseOptions,
} from '@baleada/logic'

export type Pressing = {
  status: ComputedRef<PressStatus>,
  is: {
    pressed: () => boolean,
    released: () => boolean,
  },
  press: ComputedRef<Press>,
  release: ComputedRef<Release>,
}

export type PressStatus = 'pressed' | 'released'

type Press = {
  pointerType: PointerType,
  metadata: MousepressMetadata | TouchpressMetadata | KeypressMetadata,
  sequence: (MouseEvent | TouchEvent | KeyboardEvent)[],
}

type Release = {
  pointerType: PointerType,
  metadata: MousereleaseMetadata | TouchreleaseMetadata | KeyreleaseMetadata,
  sequence: (MouseEvent | TouchEvent | KeyboardEvent)[],
}

type PointerType = 'mouse' | 'keyboard' | 'touch' // | 'pen' | 'virtual';

export type UsePressingOptions = {
  press?: UsePressingEffectOptions,
  release?: UsePressingEffectOptions,
}

type UsePressingEffectOptions = {
  mouse?: MousepressOptions,
  touch?: TouchpressOptions,
  keyboard?: KeypressOptions,
}

const defaultOptions: UsePressingOptions = {
  press: {
    mouse: { minDuration: 0 },
    touch: { minDuration: 0 },
    keyboard: { minDuration: 0 },
  },
  release: {
    mouse: { minDuration: 0 },
    touch: { minDuration: 0 },
    keyboard: { minDuration: 0 },
  },
}

export function usePressing (extendable: ExtendableElement, options: UsePressingOptions = {}): Pressing {
  // OPTIONS
  const { press: pressOptions, release: releaseOptions } = { ...defaultOptions, ...options },
        pressOptionsWithDefaults = {
          mouse: { ...defaultOptions.press.mouse, ...pressOptions?.mouse },
          touch: { ...defaultOptions.press.touch, ...pressOptions?.touch },
          keyboard: { ...defaultOptions.press.keyboard, ...pressOptions?.keyboard },
        },
        releaseOptionsWithDefaults = {
          mouse: { ...defaultOptions.release.mouse, ...releaseOptions?.mouse },
          touch: { ...defaultOptions.release.touch, ...releaseOptions?.touch },
          keyboard: { ...defaultOptions.release.keyboard, ...releaseOptions?.keyboard },
        }

  
  // ON
  const on = (
    (
      (
        options.press?.mouse
        || options.press?.touch
        || options.press?.keyboard
        || options.release?.mouse
        || options.release?.touch
        || options.release?.keyboard
      )
      && scopedOn
    )
    || inject(PressingInjectionKey)?.createOn?.({ watch, onMounted, onBeforeUnmount })
    || scopedOn
  )

  
  // ELEMENTS
  const element = narrowElement(extendable)

  
  // MULTIPLE CONCERNS
  const status = ref<PressStatus>('released'),
        press = ref<Press>(),
        release = ref<Release>()
        
  for (const recognizeable of ['mousepress', 'touchpress', 'keypress'] as const) {
    const [recognizeableEffects, pointerType] = (() => {
      switch (recognizeable) {
        case 'mousepress':
          return [createMousepress(pressOptionsWithDefaults.mouse), 'mouse']
        case 'touchpress':
          return [createTouchpress(pressOptionsWithDefaults.touch), 'touch']
        case 'keypress':
          return [createKeypress(['space', 'enter'], pressOptionsWithDefaults.keyboard), 'keyboard']
      }
    })() as [ReturnType<typeof createMousepress>, 'mouse']

    on(
      element,
      // @ts-expect-error
      {
        ...defineRecognizeableEffect(element, recognizeable as 'mousepress', {
          createEffect: (_, { listenable }) => event => {
            event.preventDefault()
            status.value = 'pressed'
            press.value = {
              pointerType,
              metadata: listenable.value.recognizeable.metadata,
              sequence: listenable.value.recognizeable.sequence,
            }
          },
          options: { listenable: { recognizeable: { effects: recognizeableEffects } } },
        })
      }
    )
  }
  
  for (const recognizeable of ['mouserelease', 'touchrelease', 'keyrelease'] as const) {
    const [recognizeableEffects, pointerType] = (() => {
      switch (recognizeable) {
        case 'mouserelease':
          return [createMouserelease(releaseOptionsWithDefaults.mouse), 'mouse']
        case 'touchrelease':
          return [createTouchrelease(releaseOptionsWithDefaults.touch), 'touch']
        case 'keyrelease':
          return [createKeyrelease(['space', 'enter'], releaseOptionsWithDefaults.keyboard as unknown as KeyreleaseOptions), 'keyboard']
      }
    })() as [ReturnType<typeof createMouserelease>, 'mouse']

    on(
      element,
      // @ts-expect-error
      {
        ...defineRecognizeableEffect(element, recognizeable as 'mouserelease', {
          createEffect: (_, { listenable }) => event => {
            event.preventDefault()
            status.value = 'released'
            release.value = {
              pointerType,
              metadata: listenable.value.recognizeable.metadata,
              sequence: listenable.value.recognizeable.sequence,
            }
          },
          options: { listenable: { recognizeable: { effects: recognizeableEffects } } },
        })
      }
    )
  }
  
  
  // API
  return {
    status: computed(() => status.value),
    is: {
      pressed: () => status.value === 'pressed',
      released: () => status.value === 'released',
    },
    press: computed(() => press.value),
    release: computed(() => release.value),
  }
}
