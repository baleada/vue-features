// https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_modal
import { ref, computed } from 'vue'
import { touchdragdrop } from '@baleada/recognizeable-handlers'
import { useConditionalDisplay, useListenables, useBindings } from '../affordances'
import { useTarget, useLabel, useDescription } from '../util'
import { number } from '@baleada/logic'
import useContentRect from './useContentRect.js'

const defaultOptions = {
  initialStatus: 'closed',
}

export default function useModal (options = {}) {
  // OPTIONS
  const {
    initialStatus,
    transition,
    drawer,
    touchdragdrop: touchdragdropOptions,
  } = { ...defaultOptions, ...options }

  // TARGETS
  const root = useTarget('single'),
        dialog = useTarget('single'),
        firstFocusable = useTarget('single'),
        lastFocusable = useTarget('single')


  // DRAWER OFFSET
  const percentClosed = ref(initialStatus === 'opened' ? 0 : 100),
        { pixels } = useContentRect(),
        onMove = hookApi => {
          const {
            metadata: {
              distance: {
                horizontal: { fromStart: horizontalDistance },
                vertical: { fromStart: verticalDistance }
              },
            }
          } = hookApi

          percentClosed.value = toPercentClosed({
            closesTo: drawer?.closesTo,
            height: pixels.value.height,
            width: pixels.value.width,
            horizontalDistance,
            verticalDistance,
          })

          touchdragdropOptions?.onMove?.(hookApi)
        }

        
  // STATUS
  const status = ref(initialStatus),
        open = () => (status.value = 'opened'),
        close = () => (status.value = 'closed')

  useConditionalDisplay({
    target: root.target,
    condition: computed(() => status.value === 'opened'),
  }, { transition: transition?.root })
  
  useConditionalDisplay({
    target: dialog.target,
    condition: computed(() => status.value === 'opened'),
  }, { transition: transition?.dialog })


  // Multiple Concerns
  useListenables({
    target: root.target,
    listenables: {
      recognizeable: {
        targetClosure: ({ listenable }) => event => {
          const {
                  direction: { fromStart: direction },
                  distance: {
                    horizontal: { fromStart: horizontalDistance },
                    vertical: { fromStart: verticalDistance },
                  }
                } = listenable.value.recognizeable.metadata.distance,
                distance = ['left', 'right'].includes(closesTo) ? horizontalDistance : verticalDistance

            switch (closesTo) {
              case 'left':
                if (
                  listenable.value.recognizeable.status === 'recognized'
                  &&
                  distance > -(touchdragdropOptions?.minDistance ?? 0)
                ) {
                  switch (direction) {
                    case 'left':
                      
                      break
                    case 'right':
                      
                      break
                  }
                }
              case 'top':
                if (
                  listenable.value.recognizeable.status === 'recognized'
                  &&
                  distance > -(touchdragdropOptions?.minDistance ?? 0)
                ) {
                  // transition
                  return
                }
            }

            switch (closesTo) {
              case 'left':
              case 'top':
                switch (`${direction} ${status.value}`) { 
                  // up
                  // right
                  // down
                  // left

                  case 'opened':
                    if (distance < 0) {
                      status.value = 'closed'
                    }
                    break
                  case 'closed':
                    if (distance > 0) {
                      status.value = 'open'
                    }
                    break
                }
                break
              case 'right':
              case 'bottom':
                
                break
            }
        },
        options: {
          listenable: {
            recognizeable: {
              handlers: touchdragdrop({
                ...(touchdragdropOptions || {}),
                onMove,
              })
            }
          },
          listen: { passive },
        }
      }
    }
  })


  // DRAWER FRAME
  const frame = ref(null)


  // WAI ARIA BASICS
  useBindings({
    target: root.target,
    bindings: {
      ariaModal: true,
    }
  })
  
  useBindings({
    target: dialog.target,
    bindings: {
      role: 'dialog',
    }
  })

  useListenables({
    target: firstFocusable.target,
    listenables: {
      'shift+tab': event => {
        event.preventDefault()
        lastFocusable.target.value.focus()
      }
    }
  })

  useListenables({
    target: lastFocusable.target,
    listenables: {
      '!shift+tab': event => {
        event.preventDefault()
        firstFocusable.target.value.focus()
      }
    }
  })
  
  useListenables({
    target: computed(() => document),
    listenables: {
      esc () {
        if (status.value === 'opened') {
          close()
        }
      }
    }
  })


  // API
  const modal = {
    root: root.handle,
    dialog: dialog.handle,
    focusable: {
      first: firstFocusable.handle,
      last: lastFocusable.handle,
    },
    status,
    open,
    close,
    percentClosed,
    frame,
  }


  // OPTIONAL REFS
  useLabel({
    text: options.label,
    labelled: dialog.target,
    feature: modal,
  })
  
  useDescription({
    uses: options.usesDescription,
    described: dialog.target,
    feature: modal,
  })
  

  return modal
}


function toPercentClosed ({ closesTo, height, width, horizontalDistance, verticalDistance }) {
  const rawPercentClosed = 100 * (() => {
    switch (closesTo) {
      case 'top':
        return -verticalDistance / height
      case 'right':
        return horizontalDistance / width
      case 'bottom':
        return verticalDistance / height
      case 'left':
        return -horizontalDistance / width
    }
  })()

  return number(rawPercentClosed).clamp({ min: 0, max: 100 }).normalize()
}
