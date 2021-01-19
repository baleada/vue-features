import { ref, shallowRef, computed, watch } from 'vue'
import { useBinding } from '../util'

export default function useConditionalDisplay ({ target, condition, watchSources }, options) {
  const originalDisplays = shallowRef(new Map()),
        cancels = shallowRef(new Map()),
        { transition } = options ?? {}

  useBinding(
    {
      target,
      bind: ({ target, value }) => {
        const didCancel = cancels.value.get(target)?.()

        if (!originalDisplays.value.get(target)) {
          const originalDisplay = window.getComputedStyle(target).display
          originalDisplays.value.set(target, originalDisplay === 'none' ? 'block' : originalDisplay) // TODO: Is block a sensible default? Is it necessary? Is there a better way to get the default display a particular tag would have?
        }

        const originalDisplay = originalDisplays.value.get(target)

        if (didCancel) {
          cancels.value.set(target, undefined)

          if (value) {
            // Transition canceled, target should be shown
            if (target.style.display === originalDisplay) {
              return
            }

            target.style.display = originalDisplay
            return
          }

          // Transition canceled, target should not be shown
          target.style.display = 'none'
          return
        }
        
        if (value) {
          if (target.style.display === originalDisplay) {
            return
          }

          const cancel = useTransition({
            target,
            // If bind is called again, bindStatus resets to 'binding', and transition should cancel
            isCanceled: computed(() => status.value === 'binding'),
            before: transition?.beforeEnter,
            start: () => (target.style.display = originalDisplay),
            transition: transition?.enter,
            end: (status, target) => {
              if (status === 'canceled') {
                target.style.display = 'none'
              }
            },
            after: transition?.afterEnter,
          })

          cancels.value.set(target, cancel)

          return
        }

        if (target.style.display === 'none') {
          return
        }

        const cancel = useTransition({
          target,
          // If bind is called again, bindStatus resets to 'binding', and transition should cancel
          isCanceled: computed(() => status.value === 'binding'),
          before: transition?.beforeExit,
          start: () => {},
          transition: transition?.exit,
          end: (status, target) => {
            if (status === 'canceled') {
              return
            }

            target.style.display = 'none'
          },
          after: transition?.afterExit,
        })

        cancels.value.set(target, cancel)
      },
      value: condition,
      watchSources,
    },
    options
  )
}

function useTransition ({ target, before, start, transition, end, after }) {
  const status = ref('ready'),
        stopWatchingStatus = shallowRef(() => {}),
        onCancel = effect => {
          stopWatchingStatus.value()

          stopWatchingStatus.value = watch(
            [status],
            () => {
              if (status.value === 'canceled') {
                effect(target)
                done()
              }
            },
            { flush: 'post' }
          )
        },
        done = () => {
          stopWatchingStatus.value()

          end(status.value, target)

          if (status.value === 'canceled') {
            return
          }

          after?.(target)
          status.value = 'transitioned'
        }

  before?.(target)
  
  start()
  status.value = 'transitioning'

  if (transition) {
    transition?.(target, done, onCancel)
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
