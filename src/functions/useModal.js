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
        drawerContainer = useTarget('single'),
        firstFocusable = useTarget('single'),
        lastFocusable = useTarget('single')


  // CONTENT RECT
  const contentRect = useContentRect()


  // DRAWER OFFSET
  const percentClosed = ref(initialStatus === 'opened' ? 0 : 100),
        onMove = hookApi => {
          const {
            event,
            metadata: {
              direction: { fromStart: direction },
              distance: {
                horizontal: { fromStart: horizontalDistance },
                vertical: { fromStart: verticalDistance }
              },
            }
          } = hookApi

          switch (drawer?.closesTo) {
            case 'left':
            case 'right':
              if (['left', 'right'].includes(direction)) {
                event.preventDefault()
              }
              break
            case 'top':
            case 'bottom':
              if (['up', 'down'].includes(direction)) {
                event.preventDefault()
              }
              break
          }

          percentClosed.value = toPercentClosed({
            closesTo: drawer?.closesTo,
            height: contentRect.pixels.value.height,
            width: contentRect.pixels.value.width,
            horizontalDistance,
            verticalDistance,
          })

          touchdragdropOptions?.onMove?.(hookApi)
        }

        
  // STATUS
  const status = ref(initialStatus),
        open = () => (status.value = 'opened'),
        close = () => (status.value = 'closed'),
        onEnd = hookApi => {
          const {
            status: touchdragdropStatus,
            metadata: {
              distance: {
                horizontal: { fromStart: horizontalDistance },
                vertical: { fromStart: verticalDistance },
              }
            }
          } = hookApi

          if (touchdragdropStatus !== 'recognized'){
            touchdragdropOptions?.onEnd?.(hookApi)
            return
          }

          const newStatus = toStatus({
            status: status.value,
            closesTo: drawer?.closesTo,
            threshold: drawer?.threshold,
            thresholdUnit: drawer?.thresholdUnit,
            percentClosed: percentClosed.value,
            horizontalDistance,
            verticalDistance,
          })

          console.log(newStatus)

          if (newStatus === status.value) {
            touchdragdropOptions?.onEnd?.(hookApi)
            // Force transition
            return
          }

          status.value = newStatus
          touchdragdropOptions?.onEnd?.(hookApi)
        }

  useConditionalDisplay({
    target: root.target,
    condition: computed(() => status.value === 'opened'),
  }, { transition: transition?.root })
  
  useConditionalDisplay({
    target: dialog.target,
    condition: computed(() => status.value === 'opened'),
  }, { transition: transition?.dialog })


  // Multiple concerns
  if (drawer?.closesTo) {
    useListenables({
      target: drawerContainer.target,
      listenables: {
        recognizeable: {
          targetClosure: () => () => { /* Do nothing. Logic is handled in touchdragdrop hooks */ },
          options: { listenable: { recognizeable: {
            handlers: touchdragdrop({
              ...(touchdragdropOptions || {}),
              onMove,
              onEnd,
            })
          } } }
        }
      }
    })
  }


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
    dialog: drawer?.closesTo
      ? () => el => {
          dialog.handle()(el)
          contentRect.ref()(el)
        }
      : dialog.handle,
    focusable: {
      first: firstFocusable.handle,
      last: lastFocusable.handle,
    },
    status,
    open,
    close,
    contentRect,
    percentClosed,
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


  if (drawer?.closesTo) {
    modal.drawerContainer = drawerContainer.handle
  }

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

function toStatus ({ status, closesTo, threshold, thresholdUnit, percentClosed, horizontalDistance, verticalDistance }) {
  console.log({ status, closesTo, threshold, thresholdUnit, percentClosed, horizontalDistance, verticalDistance })
  switch (status) {
    case 'opened':
      switch (thresholdUnit) {
        case 'pixels':
          switch (closesTo) {
            case 'top':
              return -verticalDistance > threshold ? 'closed' : 'opened'
            case 'right':
              return horizontalDistance > threshold ? 'closed' : 'opened'
            case 'bottom':
              return verticalDistance > threshold ? 'closed' : 'opened'
            case 'left':
              return -horizontalDistance > threshold ? 'closed' : 'opened'
          }
        case 'percent':
          return percentClosed > threshold ? 'closed' : 'opened'
      }
    case 'closed':
      switch (thresholdUnit) {
        case 'pixels':
          switch (closesTo) {
            case 'top':
              return verticalDistance > threshold ? 'opened' : 'closed'
            case 'right':
              return -horizontalDistance > threshold ? 'opened' : 'closed'
            case 'bottom':
              return -verticalDistance > threshold ? 'opened' : 'closed'
            case 'left':
              return horizontalDistance > threshold ? 'opened' : 'closed'
          }
        case 'percent':
          return (100 - percentClosed) > threshold ? 'closed' : 'opened'
      }
  }
}
