import { ref, computed, watch } from 'vue'
import { useBinding } from '../util'

export default function useConditionalDisplay ({ target, condition, watchSources }, options) {
  const originalDisplays = new Map(),
        statuses = ref([]),
        { transition } = options ?? {}

  watch(
    [statuses],
    () => console.log('statuses update')
  )

  useBinding(
    {
      target,
      bind: ({ target, value }) => {
        if (!originalDisplays.get(target)) {
          const originalDisplay = window.getComputedStyle(target).display
          originalDisplays.set(target, originalDisplay === 'none' ? 'block' : originalDisplay) // TODO: Is block a sensible default? Is it necessary? Is there a better way to get the default display a particular tag would have?
        }

        if (!statuses.value.find(({ target: t }) => t.isSameNode(target))) {
          statuses.value = [
            ...statuses.value,
            { target, status: 'ready' }
          ]
        }

        const originalDisplay = originalDisplays.get(target),
              status = computed({
                get: () => statuses.value.find(({ target: t }) => t.isSameNode(target)).status,
                set (status) {
                  statuses.value = [
                    ...statuses.value.filter(({ target: t }) => !t.isSameNode(target)),
                    { target, status }
                  ]
                }
              })

        status.value = 'binding'
        
        if (value) {
          if (target.style.display === originalDisplay) {
            return
          }

          useTransition({
            target,
            // If bind is called again, bindStatus resets to 'binding', and transition should cancel
            isCanceled: computed(() => status.value === 'binding'),
            before: transition?.beforeEnter,
            start: () => {
              target.style.display = originalDisplay
              status.value = 'transitioning'
            },
            transition: transition?.enter,
            end: () => {
              console.log('enter end')
              status.value = 'transitioned'
            },
            after: transition?.afterEnter,
          })

          return
        }

        if (target.style.display === 'none') {
          return
        }

        useTransition({
          target,
          // If bind is called again, bindStatus resets to 'binding', and transition should cancel
          isCanceled: computed(() => status.value === 'binding'),
          before: transition?.beforeExit,
          start: () => {
            status.value = 'transitioning'
          },
          transition: transition?.exit,
          end: () => {
            console.log('exit end')
            target.style.display = 'none'
            status.value = 'transitioned'
          },
          after: transition?.afterExit,
        })
      },
      value: condition,
      watchSources,
    },
    options
  )
}

function useTransition ({ target, isCanceled, before, start, transition, end, after }) {
  const status = ref('ready'),
        stopWatchIsCanceled = watch(
          [isCanceled],
          () => {
            if (isCanceled.value) {
              status.value = 'canceled'
              stopWatchIsCanceled()
            }
          }
        ),
        done = () => {
          stopWatchIsCanceled()

          console.log({ doneStatus: status.value })

          switch (status.value) {
            case 'transitioning':
              end?.()
              after?.(target)
              status.value = 'transitioned'
              break
          }
        }

  before?.(target)
  
  start?.()
  status.value = 'transitioning'

  if (transition) {
    transition?.(target, done, isCanceled)
  } else {
    done()
  }
}
