import { ref, computed, watch } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import { on, model } from '../affordances'
import { useTarget } from '../util'

const defaultOptions = {
  initialValue: '',
}

export function useInput (options = {}) {
  const { initialValue, completeable: completeableOptions } = { ...defaultOptions, ...options }

  // TARGET SETUP
  const element = useTarget('single')

  
  // COMPLETEABLE
  const completeable = useCompleteable(initialValue, completeableOptions),
        stringEffect = ({ target: { value: string } }) => completeable.value.setString(string),
        selectionEffect = ({ target: { selectionStart: start, selectionEnd: end, selectionDirection: direction } }) => completeable.value.setSelection({ start, end, direction }),
        arrowStatus = ref('ready') // 'ready' | 'unhandled' | 'handled'

  watch(
    () => completeable.value.selection,
    () => {
      element.target.value.setSelectionRange(
        completeable.value.selection.start,
        completeable.value.selection.end,
        completeable.value.selection.direction,
      )
    },
    { flush: 'post' }
  )

  on({
    target: element.target,
    events: {
      select (event) {
        event.preventDefault()
        selectionEffect(event)
      },
      focus () {
        completeable.value.setSelection({ start: 0, end: completeable.value.string.length, direction: 'forward' })
      },
      mouseup: selectionEffect,
      arrowKeyup: {
        targetClosure: () => event => {
          if (!event.shiftKey) {
            selectionEffect(event)
          }
        },
        options: {
          listen: { keyDirection: 'up' },
          type: 'arrow',
        },
      },
      arrowKeydown: {
        targetClosure: () => event => {
          if (!event.metaKey) {
            arrowStatus.value = 'unhandled'
          }
        },
        options: { type: 'arrow' }
      },
      cmd: {
        targetClosure: () => event => {
          if (!event.shiftKey) {
            switch (arrowStatus.value) {
              case 'ready':
              case 'handled':
                // do nothing
                break
              case 'unhandled':
                arrowStatus.value = 'handled'
                selectionEffect(event)
                break
            }
          }
        },
        options: { listen: { keyDirection: 'up' } },
      },
    }
  })
  
  model(
    {
      target: element.target,
      value: computed({
        get: () => completeable.value.string,
        set: event => {
          stringEffect(event)
          selectionEffect(event)
        }
      })
    },
    {
      toValue: event => event,
    }
  )


  // API
  return {
    element: element.api,
    completeable,
  }
}
