import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { scheduleBind, toAffordanceElementType } from '../extracted'
import type { BindElement, BindValue, AffordanceElementType } from '../extracted'
import { BindReactiveValueGetter, ensureValue, ensureWatchSourceOrSources } from './bind'

export type ShowOptions<BindElementType extends BindElement> = {
  transition?: TransitionOption<BindElementType>
}

export type TransitionOption<BindElementType extends BindElement> = {
  appear?: Transition<BindElementType> | true
  enter?: Transition<BindElementType>
  leave?: Transition<BindElementType>
}

export type Transition<BindElementType extends BindElement> = {
  before?: BindElementType extends HTMLElement | Ref<HTMLElement>
    ? () => any
    : (index: number) => any
  active?: BindElementType extends HTMLElement | Ref<HTMLElement>
    ? (done: () => void) => any
    : (index: number, done: () => void) => any
  after?: BindElementType extends HTMLElement | Ref<HTMLElement>
    ? () => any
    : (index: number) => any
  cancel?: BindElementType extends HTMLElement | Ref<HTMLElement>
    ? () => any
    : (index: number) => any
}

export function show<BindElementType extends BindElement> (
  elementOrElements: BindElementType,
  condition: BindValue<boolean> | BindReactiveValueGetter<boolean>,
  options: ShowOptions<BindElementType> = {},
) {
  const originalDisplays = new WeakMap<HTMLElement, string>(),
        cancels = new WeakMap<HTMLElement, undefined | (() => boolean)>(),
        statuses = new WeakMap<HTMLElement, 'appeared'>(),
        { transition: transitionOption } = options,
        affordanceElementType = toAffordanceElementType(elementOrElements)

  scheduleBind<boolean>(
    {
      elementOrElements,
      assign: ({ element, value, index }) => {
        const didCancel = cancels.get(element)?.()

        if (!originalDisplays.get(element)) {
          const originalDisplay = window.getComputedStyle(element).display
          originalDisplays.set(element, originalDisplay === 'none' ? 'block' : originalDisplay) // TODO: Is block a sensible default? Is it necessary? Is there a better way to get the default display a particular tag would have?
        }

        const originalDisplay = originalDisplays.get(element)

        if (didCancel) {
          cancels.set(element, undefined)

          if (value) {
            // Transition canceled, element should be shown
            if ((element as HTMLElement).style.display === originalDisplay) {
              return
            }

            (element as HTMLElement).style.display = originalDisplay
            return
          }

          // Transition canceled, element should not be shown
          (element as HTMLElement).style.display = 'none'
          return
        }

        // Leave
        if (!value) {
          if ((element as HTMLElement).style.display === 'none') {
            return
          }
  
          const cancel = transition(
            affordanceElementType,
            {
              index,
              before: transitionOption?.leave?.before,
              start: () => {},
              active: transitionOption?.leave?.active,
              end: status => {
                if (status === 'canceled') {
                  return
                }
    
                (element as HTMLElement).style.display = 'none'
              },
              after: transitionOption?.leave?.after,
              cancel: transitionOption?.leave?.cancel,
            } as TransitionConfig<typeof affordanceElementType>
          )
  
          cancels.set(element, cancel)
          return
        }

        if (value) {
          // Appear
          if (statuses.get(element) !== 'appeared') {
            if ((element as HTMLElement).style.display === originalDisplay) {
              return
            }

            const hooks = (
              (transitionOption?.appear === true && transitionOption?.enter)
              ||
              (transitionOption?.appear === false && {})
              ||
              (transitionOption?.appear)
            )
  
            const cancel = transition(
              affordanceElementType,
              {
                index,
                before: (hooks as Transition<BindElementType>)?.before,
                start: () => ((element as HTMLElement).style.display = originalDisplay),
                active: (hooks as Transition<BindElementType>)?.active,
                end: () => {},
                after: (hooks as Transition<BindElementType>)?.after,
                cancel: (hooks as Transition<BindElementType>)?.cancel,
              } as TransitionConfig<typeof affordanceElementType>
            )
  
            cancels.set(element, cancel)
            statuses.set(element, 'appeared')
            return
          }

          // Enter
          if ((element as HTMLElement).style.display === originalDisplay) {
            return
          }

          const cancel = transition(
            affordanceElementType,
            {
              index,
              before: transitionOption?.enter?.before,
              start: () => ((element as HTMLElement).style.display = originalDisplay),
              active: transitionOption?.enter?.active,
              end: () => {},
              after: transitionOption?.enter?.after,
              cancel: transitionOption?.enter?.cancel,
            } as TransitionConfig<typeof affordanceElementType>
          )

          cancels.set(element, cancel)
          return
        }
      },
      remove: () => {},
      value: ensureValue(condition) as BindValue<boolean>,
      watchSources: ensureWatchSourceOrSources(condition),
    }
  )
}


type TransitionConfig<A extends AffordanceElementType> = A extends 'single'
  ? {
    index: number,
    before: Transition<HTMLElement>['before'],
    start: () => void,
    active: Transition<HTMLElement>['active'],
    end: (status: TransitionStatus) => void,
    after: Transition<HTMLElement>['after'],
    cancel: Transition<HTMLElement>['cancel'],
  }
  : {
    index: number,
    before: Transition<HTMLElement[]>['before'],
    start: () => void,
    active: Transition<HTMLElement[]>['active'],
    end: (status: TransitionStatus) => void,
    after: Transition<HTMLElement[]>['after'],
    cancel: Transition<HTMLElement[]>['cancel'],
  }

type TransitionStatus = 'ready' | 'transitioning' | 'transitioned' | 'canceled'

function transition<A extends AffordanceElementType> (
  affordanceElementType: A,
  config: TransitionConfig<A>,
) {
  const { index } = config,
        { before, start, active, end, after, cancel } = (() => {
          if (affordanceElementType === 'single') {
            return {
              before: () => (config as TransitionConfig<'single'>).before?.(),
              start: () => config.start?.(),
              active: () => (config as TransitionConfig<'single'>).active?.(done),
              end: () => config.end?.(status.value),
              after: () => (config as TransitionConfig<'single'>).after?.(),
              cancel: () => (config as TransitionConfig<'single'>).cancel?.(),
            }
          }

          return {
            before: () => (config as TransitionConfig<'multiple'>).before?.(index),
            start: () => config.start?.(),
            active: () => (config as TransitionConfig<'multiple'>).active?.(index, done),
            end: () => config.end?.(status.value),
            after: () => (config as TransitionConfig<'multiple'>).after?.(index),
            cancel: () => (config as TransitionConfig<'multiple'>).cancel?.(index),
          }
        })(),
        status = ref<TransitionStatus>('ready'),
        done = () => {
          stopWatchingStatus()

          end()

          if (status.value === 'canceled') {
            return
          }

          after()
          status.value = 'transitioned'
        }

  before()
  
  start()
  status.value = 'transitioning'

  // TODO: Watcher may not be necessary
  const stopWatchingStatus = watch(
    [status],
    () => {
      if (status.value === 'canceled') {
        cancel()
        done()
      }
    },
    { flush: 'post' }
  )

  if (active) {
    active()
  } else {
    done()
  }

  return () => {
    if (status.value === 'transitioned') {
      return false
    }
    
    status.value = 'canceled'
    return true
  }
}
