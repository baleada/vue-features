import { onMounted, onBeforeUnmount, watch } from 'vue'
import { ensureTargetsRef } from '../util'
import type { Target } from '../util'

export type NaiveOnValue<EventType> = NaiveOnCallback<EventType> | NaiveOnCallbackObject<EventType>

export type NaiveOnCallback<EventType> = (event: EventType) => any

export type NaiveOnTargetClosure<EventType> = ({ target, index: targetIndex, off }: {
  target: Element,
  index: number,
  off: () => void,
}) => NaiveOnCallback<EventType>

export type NaiveOnCallbackObject<EventType> = {
  targetClosure: NaiveOnTargetClosure<EventType>,
  options?: AddEventListenerOptions,
}

type HandledEvent<EventType> = {
  target: Element,
  targetIndex: number,
  eventIndex: number,
  type: string,
  callback: NaiveOnCallback<EventType>,
  options?: AddEventListenerOptions,
}

export function naiveOn ({ target: rawTargets, events: rawEvents }: {
  target: Target,
  events: Record<string, NaiveOnValue<any>>
}): void {
  const targets = ensureTargetsRef(rawTargets),
        events = Object.entries(rawEvents).map(([type, rawListener]) => ({ type, listener: ensureListener(rawListener) })),
        handledEvents = new Set<HandledEvent<any>>(),
        effect = () => {
          events.forEach((event, eventIndex) => {
            targets.value.forEach((target, targetIndex) => {
              if (!target) {
                return
              }

              const { type, listener: { targetClosure, options } } = event

              cleanup({ target, type }) // Gotta clean up closures around potentially stale target indices.

              const off = () => {
                      cleanup({ target, type })
                    },
                    callback = e => targetClosure({ target, index: targetIndex, off })(e)

              target.addEventListener(type, callback, options)
              handledEvents.add({ target, targetIndex, eventIndex, type, callback, options })
            })
          })
        },
        cleanup = (options: {
          target?: Element,
          type?: string,
        } = {}) => {
          const { target, type } = options

          if (target) {
            const handledEvent = [...handledEvents].find(({ target: ta, type: ty }) => ta === target && ty === type)

            if (handledEvent) {
              remove(handledEvent)
            }

            return
          }

          handledEvents.forEach(handledEvent => remove(handledEvent))
        },
        remove = (handledEvent: HandledEvent<any>) => {
          const { target, type, callback, options } = handledEvent

          target.removeEventListener(type, callback, options)
          handledEvents.delete(handledEvent)
        }
  
  onMounted(() => {
    effect()
    watch(
      [() => targets.value],
      effect,
      { flush: 'post' }
    )
  })

  onBeforeUnmount(() => cleanup())
}

export function defineNaiveOnValue<EventType> (bindValue: NaiveOnValue<EventType>): NaiveOnValue<EventType> {
  return bindValue
}

function ensureListener<EventType> (rawListener: NaiveOnCallback<EventType> | NaiveOnCallbackObject<EventType>): NaiveOnCallbackObject<EventType> {
  return typeof rawListener === 'function'
    ? { targetClosure: () => rawListener }
    : {
        targetClosure: rawListener.targetClosure,
        options: rawListener.options,
      }
}
