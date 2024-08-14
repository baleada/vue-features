import {
  ref,
  shallowRef,
  computed,
  inject,
  watch,
  onMounted,
  onScopeDispose,
} from 'vue'
import type { ComputedRef } from 'vue'
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
import { defineRecognizeableEffect, on as scopedOn } from '../affordances'
import { narrowElement, WithPressInjectionKey } from '../extracted'
import type { ExtendableElement } from '../extracted'

export type WithPress = {
  status: ComputedRef<PressStatus>,
  is: {
    pressed: () => boolean,
    released: () => boolean,
  },
  press: ComputedRef<Press>,
  release: ComputedRef<Release>,
}

export type PressStatus = 'pressed' | 'released'

// TODO: pen and virtual pointer types

export type Press = (
  {
    kind: 'mouse',
    metadata: MousepressMetadata,
    sequence: MouseEvent[],
  }
  | {
    kind: 'touch',
    metadata: TouchpressMetadata,
    sequence: TouchEvent[],
  }
  | {
    kind: 'keyboard',
    metadata: KeypressMetadata,
    sequence: KeyboardEvent[],
  }
)

export type Release = (
  {
    kind: 'mouse',
    metadata: MousereleaseMetadata,
    sequence: MouseEvent[],
  }
  | {
    kind: 'touch',
    metadata: TouchreleaseMetadata,
    sequence: TouchEvent[],
  }
  | {
    kind: 'keyboard',
    metadata: KeyreleaseMetadata,
    sequence: KeyboardEvent[],
  }
)

export type UseWithPressOptions = {
  press?: UseWithPressEffectOptions,
  release?: UseWithPressEffectOptions,
}

type UseWithPressEffectOptions = {
  mouse?: MousepressOptions | false,
  touch?: TouchpressOptions | false,
  keyboard?: KeypressOptions | false,
}

const defaultOptions: UseWithPressOptions = {
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

export function useWithPress (extendable: ExtendableElement, options: UseWithPressOptions = {}): WithPress {
  // OPTIONS
  const { press: pressOptions, release: releaseOptions } = { ...defaultOptions, ...options },
        pressOptionsWithDefaults = {
          mouse: pressOptions?.mouse === false
            ? pressOptions?.mouse
            : { ...defaultOptions.press.mouse, ...pressOptions?.mouse },
          touch: pressOptions?.touch === false
            ? pressOptions?.touch
            : { ...defaultOptions.press.touch, ...pressOptions?.touch },
          keyboard: pressOptions?.keyboard === false
            ? pressOptions?.keyboard
            : { ...defaultOptions.press.keyboard, ...pressOptions?.keyboard },
        },
        releaseOptionsWithDefaults = {
          mouse: releaseOptions?.mouse === false
            ? releaseOptions?.mouse
            : { ...defaultOptions.release.mouse, ...releaseOptions?.mouse },
          touch: releaseOptions?.touch === false
            ? releaseOptions?.touch
            : { ...defaultOptions.release.touch, ...releaseOptions?.touch },
          keyboard: releaseOptions?.keyboard === false
            ? releaseOptions?.keyboard
            : { ...defaultOptions.release.keyboard, ...releaseOptions?.keyboard },
        }

  // ON
  const on = (
    options.press?.mouse
    || options.press?.touch
    || options.press?.keyboard
    || options.release?.mouse
    || options.release?.touch
    || options.release?.keyboard
  )
    ? scopedOn
    : inject(
      WithPressInjectionKey,
      { createOn: () => scopedOn }
    )?.createOn?.({ watch, onMounted, onScopeDispose })


  // ELEMENTS
  const element = narrowElement(extendable)


  // MULTIPLE CONCERNS
  const status = ref<PressStatus>('released'),
        press = shallowRef<Press>(),
        release = shallowRef<Release>()

  for (const recognizeableType of ['mousepress', 'touchpress', 'keypress'] as const) {
    const [recognizeableEffects, kind] = (() => {
      switch (recognizeableType) {
        case 'mousepress':
          if (!pressOptionsWithDefaults.mouse) return []
          return [createMousepress(pressOptionsWithDefaults.mouse), 'mouse']
        case 'touchpress':
          if (!pressOptionsWithDefaults.touch) return []
          return [createTouchpress(pressOptionsWithDefaults.touch), 'touch']
        case 'keypress':
          if (!pressOptionsWithDefaults.keyboard) return []
          return [createKeypress(['space', 'enter'], pressOptionsWithDefaults.keyboard), 'keyboard']
      }
    })() as [ReturnType<typeof createMousepress>, 'mouse']

    if (!recognizeableEffects) continue

    on(
      element,
      // @ts-expect-error
      {
        ...defineRecognizeableEffect(element, recognizeableType as 'mousepress', {
          createEffect: ({ listenable }) => () => {
            status.value = 'pressed'
            press.value = {
              kind,
              metadata: listenable.recognizeable.metadata,
              sequence: listenable.recognizeable.sequence,
            }
          },
          options: { listenable: { recognizeable: { effects: recognizeableEffects } } },
        }),
      }
    )
  }

  for (const recognizeable of ['mouserelease', 'touchrelease', 'keyrelease'] as const) {
    const [recognizeableEffects, kind] = (() => {
      switch (recognizeable) {
        case 'mouserelease':
          if (!releaseOptionsWithDefaults.mouse) return []
          return [createMouserelease(releaseOptionsWithDefaults.mouse), 'mouse']
        case 'touchrelease':
          if (!releaseOptionsWithDefaults.touch) return []
          return [createTouchrelease(releaseOptionsWithDefaults.touch), 'touch']
        case 'keyrelease':
          if (!releaseOptionsWithDefaults.keyboard) return []
          return [createKeyrelease(['space', 'enter'], releaseOptionsWithDefaults.keyboard as unknown as KeyreleaseOptions), 'keyboard']
      }
    })() as [ReturnType<typeof createMouserelease>, 'mouse']

    if (!recognizeableEffects) continue

    on(
      element,
      // @ts-expect-error
      {
        ...defineRecognizeableEffect(element, recognizeable as 'mouserelease', {
          createEffect: ({ listenable }) => () => {
            status.value = 'released'
            release.value = {
              kind,
              metadata: listenable.recognizeable.metadata,
              sequence: listenable.recognizeable.sequence,
            }
          },
          options: { listenable: { recognizeable: { effects: recognizeableEffects } } },
        }),
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
