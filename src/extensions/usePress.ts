import {
  ref,
  shallowRef,
  computed,
  inject,
  watch,
  onMounted,
  onScopeDispose,
  type ComputedRef,
} from 'vue'
import {
  createPointerpress,
  createKeypress,
  createOmit,
  createKeys,
  type PointerpressOptions,
  type KeypressOptions,
  type PointerpressMetadata,
  type KeypressMetadata,
} from '@baleada/logic'
import { pipe, toLength } from 'lazy-collections'
import {
  defineRecognizeableEffect,
  on as scopedOn,
} from '../affordances'
import {
  narrowElement,
  PressInjectionKey,
  type ExtendableElement,
  defaultPressInjection,
  supportedKeyboardOptions,
  supportedPointerOptions,
  toLastPointeroutTarget,
} from '../extracted'

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
    kind: 'mouse' | 'touch' | 'pen' | 'pointer',
    metadata: PointerpressMetadata,
    sequence: PointerEvent[],
  }
  | {
    kind: 'keyboard',
    metadata: KeypressMetadata,
    sequence: KeyboardEvent[],
  }
)

export type UsePressOptions = {
  pointer?: PointerpressOptions | false,
  keyboard?: KeypressOptions | false,
}

export function usePress (extendable: ExtendableElement, options: UsePressOptions = {}): Press {
  // OPTIONS
  const { pointer, keyboard } = options,
        withStatusEffect: {
          pointer?: PointerpressOptions,
          keyboard?: KeypressOptions,
        } = {
          ...(
            pointer === false
              ? {}
              : {
                pointer: {
                  ...pointer,
                  onOut: api => {
                    const lastPointeroutTarget = toLastPointeroutTarget(api.sequence)

                    if (
                      !lastPointeroutTarget
                      || lastPointeroutTarget !== element.value
                    ) {
                      pointer?.onOut?.(api)
                      return
                    }

                    status.value = 'released'
                    pointer?.onOut?.(api)
                  },
                  onUp: api => {
                    status.value = 'released'
                    pointer?.onUp?.(api)
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
                  onUp: api => {
                    status.value = 'released'
                    keyboard?.onUp?.(api)
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
      defaultPressInjection
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

  watch(
    element,
    current => {
      if (!current) status.value = 'released'
    },
    { flush: 'post' }
  )

  for (const recognizeableType of ['pointerpress', 'keypress'] as const) {
    const [recognizeableEffects, kind] = (() => {
      switch (recognizeableType) {
        case 'pointerpress':
          if (pointer === false) return []
          return [createPointerpress(withStatusEffect.pointer), 'pointer']
        case 'keypress':
          if (keyboard === false) return []
          return [createKeypress(['space', 'enter'], withStatusEffect.keyboard), 'keyboard']
      }
    })() as [ReturnType<typeof createPointerpress>, 'pointer']

    if (!recognizeableEffects) continue

    on(
      element,
      // @ts-expect-error
      {
        ...defineRecognizeableEffect(element, recognizeableType as 'pointerpress', {
          createEffect: ({ listenable }) => event => {
            status.value = 'pressed'
            descriptor.value = {
              kind: (kind === 'pointer' && event.pointerType)
                ? event.pointerType as 'mouse' | 'touch' | 'pen'
                : kind,
              metadata: listenable.recognizeable.metadata,
              sequence: listenable.recognizeable.sequence,
            }

            if (listenable.recognizeable.sequence[0] === firstDescriptor.value?.sequence[0]) return
            firstDescriptor.value = descriptor.value
          },
          options: {
            listenable: { recognizeable: { effects: recognizeableEffects } },
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
        toCustomOptionsLengthTerm(options.pointer as PointerpressOptions, supportedPointerOptions)
        + toCustomOptionsLengthTerm(options.keyboard as KeypressOptions, supportedKeyboardOptions)
      ),
      toCustomOptionsLengthTerm = <FactoryOptions extends PointerpressOptions | KeypressOptions>(
        options: FactoryOptions,
        supportedOptions: (
          Required<FactoryOptions> extends Required<PointerpressOptions> ? typeof supportedPointerOptions :
            Required<FactoryOptions> extends Required<KeypressOptions> ? typeof supportedKeyboardOptions :
              never
        ),
      ) => pipe(
        () => options || {},
        createOmit(supportedOptions),
        createKeys(),
        toLength(),
      )() as number

