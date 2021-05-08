import { onMounted, watch } from 'vue'
import type { Ref } from 'vue'
import { useListenable } from '@baleada/vue-composition'
import type { Listenable, ListenableOptions, ListenableSupportedEvent, ListenableSupportedType, ListenHandle, ListenOptions } from '@baleada/logic'
import { ensureTargetsRef } from '../util'
import type { Target } from '../util'
import { defineNaiveOnValue } from './naiveOn'

export type OnValue<EventType extends ListenableSupportedType> = OnCallback<EventType> | OnCallbackObject<EventType>

export type OnCallback<EventType extends ListenableSupportedType> = ListenHandle<EventType>

export type OnTargetClosure<EventType extends ListenableSupportedType> = ({ target, index: targetIndex, off }: {
  target: Element,
  index: number,
  off: () => void,
  listenable: Ref<Listenable<EventType>>
}) => OnCallback<EventType>

export type OnCallbackObject<EventType extends ListenableSupportedType> = {
  targetClosure: OnTargetClosure<EventType>,
  options?: {
    type?: string // See useInput arrow key handlers for example of why this is supported
    listenable?: ListenableOptions<EventType>,
    listen?: ListenOptions<EventType>,
  },
}

// TODO: Support modifiers: https://v3.vuejs.org/api/directives.html#v-on
// Not all are necessary, as Listenable solves a lot of those problems.
// .once might be worth supporting.
export function on ({ target: rawTargets, events: rawEvents }: {
  target: Target,
  events: Record<string, OnValue<any>>
}) {
  const targets = ensureTargetsRef(rawTargets),
        events = Object.entries(rawEvents).map(([type, rawListenParams]) => {
          const { targetClosure, options } = ensureListenParams(rawListenParams)
          
          return {
            listenable: useListenable(options?.type || type, options?.listenable),
            listenParams: { targetClosure, options: options?.listen }
          }
        }),
        effect = () => {
          events.forEach(({ listenable, listenParams: { targetClosure, options } }) => {            
            targets.value.forEach((target, index) => {
              if (!target) {
                return
              }

              listenable.value.stop({ target }) // Gotta clean up closures around potentially stale target indices.

              const off = () => {
                listenable.value.stop({ target })
              }

              listenable.value.listen(
                e => targetClosure({ target, index, off, listenable })(e), // Listenable instance is particularly useful for accessing Recognizeable metadata
                { ...options, target }
              )
            })
          })
        }

  onMounted(() => {
    effect()
    watch(
      [() => targets.value],
      effect,
      { flush: 'post' }
    )
  })

  // useListenable cleans up side effects automatically
}

export function defineOnValue<EventType extends ListenableSupportedType> (bindValue: OnValue<EventType>): OnValue<EventType> {
  return bindValue
}

function ensureListenParams<EventType extends ListenableSupportedType> (rawListenable: OnCallback<EventType> | OnCallbackObject<EventType>): OnCallbackObject<EventType> {
  return typeof rawListenable === 'function'
    ? { targetClosure: () => rawListenable }
    : {
        targetClosure: rawListenable.targetClosure,
        options: rawListenable.options,
      }
}
