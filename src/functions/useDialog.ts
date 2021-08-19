// https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_modal
import { ref, computed } from 'vue'
import { touchdragdrop } from '@baleada/recognizeable-effects'
import { show, on, bind } from '../affordances'
import { useSingleTarget, useMultipleTargets, useLabel, useDescription, SingleTargetApi } from '../util'
import { createClamp } from '@baleada/logic'
import { useContentRect } from './useContentRect.js'

const defaultOptions = {
  initialStatus: 'closed',
}

export type Dialog = {
  root: SingleTargetApi,
  dialog: SingleTargetApi,
  focusable: {
    first: SingleTargetApi,
    last: SingleTargetApi,
  },
  status: 'opened' | 'closed',
  open: () => void,
  close: () => void,
}

export type UseDialogOptions = {
  initialStatus?: 'opened' | 'closed',
}

export function useDialog (options: UseDialogOptions = {}): Dialog {
  // OPTIONS
  const {
    initialStatus,
    transition,
    drawer,
    touchdragdrop: touchdragdropOptions,
  } = { ...defaultOptions, ...options }


  // TARGETS
  const root = useSingleTarget(),
        dialog = useSingleTarget(),
        drawerContainer = useSingleTarget(),
        firstFocusable = useSingleTarget(),
        lastFocusable = useSingleTarget()


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

  show({
    element: root.element,
    condition: computed(() => status.value === 'opened'),
  }, { transition: transition?.root })
  
  show({
    element: dialog.element,
    condition: computed(() => status.value === 'opened'),
  }, { transition: transition?.dialog })


  // Multiple concerns
  if (drawer?.closesTo) {
    on({
      element: drawerContainer.element,
      effects: {
        recognizeable: {
          targetClosure: () => () => { /* Do nothing. Logic is handled in touchdragdrop hooks */ },
          options: { listenable: { recognizeable: {
            effects: touchdragdrop({
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
  bind({
    element: root.element,
    values: {
      ariaModal: true,
    }
  })
  
  bind({
    element: dialog.element,
    values: {
      role: 'dialog',
    }
  })

  on<'shift+tab'>({
    element: firstFocusable.element,
    effects: defineEffect => [
      defineEffect(
        'shift+tab',
        event => {
          event.preventDefault()
          lastFocusable.target.value.focus()
        }
      ),
    ]
  })

  on<'!shift+tab'>({
    element: lastFocusable.element,
    effects: defineEffect => [
      defineEffect(
        '!shift+tab',
        event => {
          event.preventDefault()
          firstFocusable.target.value.focus()
        }
      ),
    ]
  })
  
  on<'+esc'>({
    target: computed(() => document),
    effects: defineEffect => [
      defineEffect(
        'esc' as '+esc',
         () => {
          if (status.value === 'opened') {
            close()
          }
        }
    ]
  })

  // API
  const modal = {
    root: root.api,
    dialog: drawer?.closesTo
      ? {
          ref: el => {
            dialog.handle(el)
            contentRect.element.ref(el)
          },
          el: dialog.target,
        }
      : dialog.api,
    focusable: {
      first: firstFocusable.api,
      last: lastFocusable.api,
    },
    status,
    open,
    close,
  }
  
  
  // OPTIONAL API
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
    modal.drawerContainer = drawerContainer.api
    modal.percentClosed = percentClosed
    modal.contentRect = contentRect
  }

  return modal
}

const clamp = createClamp({ min: 0, max: 100 })
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

  return clamp(rawPercentClosed)
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
          return (100 - percentClosed) > threshold ? 'opened' : 'closed'
      }
  }
}
