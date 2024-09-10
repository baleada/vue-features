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
  createOmit,
  createKeys,
} from '@baleada/logic'
import type {
  MousepressOptions,
  TouchpressOptions,
  KeypressOptions,
  MousepressMetadata,
  TouchpressMetadata,
  KeypressMetadata,
} from '@baleada/logic'
import { pipe, toLength } from 'lazy-collections'
import { defineRecognizeableEffect, on as scopedOn } from '../affordances'
import { narrowElement, PressInjectionKey } from '../extracted'
import type { ExtendableElement } from '../extracted'
import { supportedKeyboardOptions, supportedMouseOptions, supportedTouchOptions } from '../extracted/delegatePress'

export type Press = {
  status: ComputedRef<PressStatus>,
  is: {
    pressed: () => boolean,
    released: () => boolean,
  },
  descriptor: ComputedRef<PressDescriptor>,
  firstDescriptor: ComputedRef<PressDescriptor>,
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

export type UsePressOptions = {
  mouse?: MousepressOptions | false,
  touch?: TouchpressOptions | false,
  keyboard?: KeypressOptions | false,
}

export function usePress (extendable: ExtendableElement, options: UsePressOptions = {}): Press {
  // OPTIONS
  const { mouse, touch, keyboard } = options,
        withStatusEffect: {
          mouse?: MousepressOptions,
          touch?: TouchpressOptions,
          keyboard?: KeypressOptions,
        } = {
          ...(
            mouse === false
              ? {}
              : {
                mouse: {
                  ...mouse,
                  onUp: (...params) => {
                    status.value = 'released'
                    mouse?.onUp?.(...params)
                  },
                },
              }
          ),
          ...(
            touch === false
              ? {}
              : {
                touch: {
                  ...touch,
                  onEnd: (...params) => {
                    status.value = 'released'
                    touch?.onEnd?.(...params)
                  },
                },
              }
          ),
          ...(
            keyboard === false
              ? {}
              : {
                keyboard: {
                  ...keyboard,
                  onUp: (...params) => {
                    status.value = 'released'
                    keyboard?.onUp?.(...params)
                  },
                },
              }
          ),
        }

  // ON
  const on = toCustomOptionsLength(options)
    ? scopedOn
    : inject(
      PressInjectionKey,
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
  const status = ref<PressStatus>('released'),
        descriptor = shallowRef<PressDescriptor>(),
        firstDescriptor = shallowRef<PressDescriptor>()

  for (const recognizeableType of ['mousepress', 'touchpress', 'keypress'] as const) {
    const [recognizeableEffects, kind] = (() => {
      switch (recognizeableType) {
        case 'mousepress':
          if (mouse === false) return []
          return [createMousepress(withStatusEffect.mouse), 'mouse']
        case 'touchpress':
          if (touch === false) return []
          return [createTouchpress(withStatusEffect.touch), 'touch']
        case 'keypress':
          if (keyboard === false) return []
          return [createKeypress(['space', 'enter'], withStatusEffect.keyboard), 'keyboard']
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
          options: {
            listenable: { recognizeable: { effects: recognizeableEffects } },
            listen: recognizeableType === 'touchpress' ? { addEventListener: { passive: true } } : {},
          },
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
  }
}

const toCustomOptionsLength = (options: UsePressOptions) => (
        toCustomOptionsLengthTerm(options.mouse as MousepressOptions, supportedMouseOptions)
        + toCustomOptionsLengthTerm(options.touch as TouchpressOptions, supportedTouchOptions)
        + toCustomOptionsLengthTerm(options.keyboard as KeypressOptions, supportedKeyboardOptions)
      ),
      toCustomOptionsLengthTerm = <FactoryOptions extends MousepressOptions | TouchpressOptions | KeypressOptions>(
        options: FactoryOptions,
        supportedOptions: (
          Required<FactoryOptions> extends Required<MousepressOptions> ? typeof supportedMouseOptions :
          Required<FactoryOptions> extends Required<TouchpressOptions> ? typeof supportedTouchOptions :
          Required<FactoryOptions> extends Required<KeypressOptions> ? typeof supportedKeyboardOptions :
          never
        ),
      ) => pipe(
        () => options || {},
        createOmit(supportedOptions),
        createKeys(),
        toLength(),
      )() as number

