import { ref, computed, inject, watch, onMounted, onBeforeUnmount } from 'vue'
import type { ComputedRef } from 'vue'
import { defineRecognizeableEffect, on as localOn } from '../affordances'
import { ensureElementFromExtendable, PressStateInjectionKey } from '../extracted'
import type { Extendable } from '../extracted'
import {
  mousepress,
  touchpress,
  keypress,
MousepressMetadata,
TouchpressMetadata,
KeypressMetadata,
} from '@baleada/recognizeable-effects'
import type {
  MousepressOptions,
  TouchpressOptions,
  KeypressOptions,
} from '@baleada/recognizeable-effects'

export type PressState = {
  status: ComputedRef<PressStatus>,
  is: {
    pressed: () => boolean,
    released: () => boolean,
  },
  event: ComputedRef<PressEvent>,
  duration: ComputedRef<number>,
}

export type PressStatus = 'pressed' | 'released'

type PressEvent = {
  pointerType: PointerType,
  metadata: MousepressMetadata | TouchpressMetadata | KeypressMetadata,
  matches: (combo: string) => boolean
}

type PointerType = 'mouse' | 'keyboard' | 'touch' // | 'pen' | 'virtual';

export type UsePressStateOptions = {
  mouse?: MousepressOptions,
  touch?: TouchpressOptions,
  keyboard?: KeypressOptions,
}

const defaultOptions: UsePressStateOptions = {
  mouse: {
    minDuration: 0,
    effectLimit: 1,
  },
  touch: {
    minDuration: 0,
    effectLimit: 1,
  },
  keyboard: {
    minDuration: 0,
    effectLimit: 1,
  },
}

export function usePressState (extendable: Extendable, options: UsePressStateOptions = {}): PressState {
  const on = localOn // TODO: inject(PressStateInjectionKey)?.createOn?.(watch, onMounted, onBeforeUnmount) || localOn

  
  // OPTIONS
  const { mouse, touch, keyboard } = { ...defaultOptions, ...options },
        mouseWithDefaults = {
          ...defaultOptions.mouse,
          ...mouse,
        },
        touchWithDefaults = {
          ...defaultOptions.touch,
          ...touch,
        },
        keyboardWithDefaults = {
          ...defaultOptions.keyboard,
          ...keyboard,
        }

  
  // ELEMENTS
  const element = ensureElementFromExtendable(extendable)

  
  // MULTIPLE CONCERNS
  const status = ref<PressStatus>('released'),
        duration = ref<number>(0),
        event = ref<PressEvent>()
  
  on(
    element,
    {
      ...defineRecognizeableEffect(element, 'mousepress', {
        createEffect: (_, { listenable }) => (_event, { matches }) => {
          _event.preventDefault()
          status.value = 'pressed'
          event.value = {
            pointerType: 'mouse',
            metadata: listenable.value.recognizeable.metadata,
            matches,
          }
        },
        options: { listenable: { recognizeable: { effects: mousepress({
          ...mouseWithDefaults,
          onUp: api => {
            status.value = 'released',
            mouse.onUp?.(api)
          }
        }) } } },
      })
    }
  )

  on(
    element,
    {
      ...defineRecognizeableEffect(element, 'touchpress', {
        createEffect: (_, { listenable }) => (_event) => {
          _event.preventDefault()
          status.value = 'pressed'
          event.value = {
            pointerType: 'touch',
            metadata: listenable.value.recognizeable.metadata,
            matches: () => false,
          }
        },
        options: {
          listen: { addEventListener: { passive: false } },
          listenable: { recognizeable: { effects: touchpress({
            ...touchWithDefaults,
            onEnd: api => {
              status.value = 'released',
              touch.onEnd?.(api)
            }
          }) } }
        },
      }),
    }
  )

  on(
    element,
    {
      ...defineRecognizeableEffect(element, 'keypress', {
        createEffect: (_, { listenable }) => (_event, { matches }) => {
          _event.preventDefault()
          status.value = 'pressed'
          event.value = {
            pointerType: 'keyboard',
            metadata: listenable.value.recognizeable.metadata,
            matches,
          }
        },
        options: { listenable: { recognizeable: { effects: keypress(['space', 'enter'], {
          ...keyboardWithDefaults,
          onUp: api => {
            status.value = 'released',
            keyboard.onUp?.(api)
          }
        }) } } },
      })
    }
  )
  
  // API
  return {
    status: computed(() => status.value),
    is: {
      pressed: () => status.value === 'pressed',
      released: () => status.value === 'released',
    },
    event: computed(() => event.value),
    duration: computed(() => duration.value),
  }
}
