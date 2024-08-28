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
  MousereleaseOptions,
  TouchreleaseMetadata,
  TouchreleaseOptions,
  KeyreleaseMetadata,
  KeyreleaseOptions,
} from '@baleada/logic'
import { defineRecognizeableEffect, on as scopedOn } from '../affordances'
import { narrowElement, PressInjectionKey } from '../extracted'
import type { ExtendableElement } from '../extracted'

export type Press = {
  status: ComputedRef<PressStatus>,
  is: {
    pressed: () => boolean,
    released: () => boolean,
  },
  descriptor: ComputedRef<PressDescriptor>,
  firstDescriptor: ComputedRef<PressDescriptor>,
  releaseDescriptor: ComputedRef<ReleaseDescriptor>,
}

export type PressStatus = 'pressed' | 'released'

// TODO: pen and virtual pointer types

export type PressDescriptor = (
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

export type ReleaseDescriptor = (
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

export type UsePressOptions = {
  press?: {
    mouse?: MousepressOptions | false,
    touch?: TouchpressOptions | false,
    keyboard?: KeypressOptions | false,
  },
  release?: {
    mouse?: MousereleaseOptions | false,
    touch?: TouchreleaseOptions | false,
    keyboard?: KeyreleaseOptions | false,
  },
}

const defaultOptions: UsePressOptions = {
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

export function usePress (extendable: ExtendableElement, options: UsePressOptions = {}): Press {
  // OPTIONS
  const { press: pressOptions, release: releaseOptions } = { ...defaultOptions, ...options },
        pressOptionsWithDefaults = {
          mouse: toFalseOrOptions(defaultOptions.press.mouse, pressOptions?.mouse),
          touch: toFalseOrOptions(defaultOptions.press.touch, pressOptions?.touch),
          keyboard: toFalseOrOptions(defaultOptions.press.keyboard, pressOptions?.keyboard),
        },
        releaseOptionsWithDefaults = {
          mouse: toFalseOrOptions(defaultOptions.release.mouse, releaseOptions?.mouse),
          touch: toFalseOrOptions(defaultOptions.release.touch, releaseOptions?.touch),
          keyboard: toFalseOrOptions(defaultOptions.release.keyboard, releaseOptions?.keyboard),
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
      PressInjectionKey,
      { createOn: () => scopedOn }
    )?.createOn?.({ watch, onMounted, onScopeDispose })


  // ELEMENTS
  const element = narrowElement(extendable)


  // MULTIPLE CONCERNS
  const status = ref<PressStatus>('released'),
        descriptor = shallowRef<PressDescriptor>(),
        firstDescriptor = ref<PressDescriptor>(),
        releaseDescriptor = shallowRef<ReleaseDescriptor>()

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
            descriptor.value = {
              kind,
              metadata: listenable.recognizeable.metadata,
              sequence: listenable.recognizeable.sequence,
            }

            if (listenable.recognizeable.sequence[0] === firstDescriptor.value?.sequence[0]) return
            firstDescriptor.value = descriptor.value
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
            releaseDescriptor.value = {
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
    descriptor: computed(() => descriptor.value),
    firstDescriptor: computed(() => firstDescriptor.value),
    releaseDescriptor: computed(() => releaseDescriptor.value),
  }
}

function toFalseOrOptions<
  FalseOrOptions extends (
    | UsePressOptions['press']['mouse']
    | UsePressOptions['press']['touch']
    | UsePressOptions['press']['keyboard']
    | UsePressOptions['release']['mouse']
    | UsePressOptions['release']['touch']
    | UsePressOptions['release']['keyboard']
  )
> (defaultOptions: FalseOrOptions, options: FalseOrOptions): FalseOrOptions {
  return options === false
    ? options
    : { ...defaultOptions, ...options }
}
