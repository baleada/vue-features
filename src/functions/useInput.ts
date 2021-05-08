import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import type { Completeable, CompleteableOptions } from '@baleada/logic'
import { on, defineOnValue, model, defineBindValue } from '../affordances'
import { useSingleTarget } from '../util'
import type { SingleTargetApi } from '../util'

export type Input = {
  element: SingleTargetApi,
  completeable: Ref<Completeable>,
}

export type UseInputOptions = {
  initialValue?: string,
  completeable?: CompleteableOptions
}

const defaultOptions: UseInputOptions = {
  initialValue: '',
}

export function useInput (options: UseInputOptions = {}): Input {
  const { initialValue, completeable: completeableOptions } = { ...defaultOptions, ...options }

  // TARGET SETUP
  const element = useSingleTarget()

  
  // COMPLETEABLE
  const completeable = useCompleteable(initialValue, completeableOptions),
        stringEffect = (event: Event) => completeable.value.setString((event.target as HTMLInputElement).value),
        selectionEffect = (event: Event) => completeable.value.setSelection({
          start: (event.target as HTMLInputElement).selectionStart,
          end: (event.target as HTMLInputElement).selectionEnd,
          direction: (event.target as HTMLInputElement).selectionDirection,
        }),
        arrowStatus = ref('ready') // 'ready' | 'unhandled' | 'handled'

  watch(
    () => completeable.value.selection,
    () => {
      (element.target.value as HTMLInputElement).setSelectionRange(
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
      select (event: Event) {
        event.preventDefault()
        selectionEffect(event)
      },
      focus: () => {
        completeable.value.setSelection({ start: 0, end: completeable.value.string.length, direction: 'forward' })
      },
      mouseup: selectionEffect,
      arrowKeyup: defineOnValue<KeyboardEvent>({
        targetClosure: () => (event: KeyboardEvent) => {
          if (!event.shiftKey) {
            selectionEffect(event)
          }
        },
        options: {
          listen: { keyDirection: 'up' },
          type: 'arrow',
        },
      }),
      arrowKeydown: defineOnValue<KeyboardEvent>({
        targetClosure: () => event => {
          if (!event.metaKey) {
            arrowStatus.value = 'unhandled'
          }
        },
        options: { type: 'arrow' }
      }),
      cmd: defineOnValue<KeyboardEvent>({
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
      }),
    }
  })
  
  model<unknown, Event>(
    {
      target: element.target,
      // @ts-ignore because WritableComputedRef can only handle matching get/set types
      value: computed({
        get: () => completeable.value.string,
        set: (event: Event) => {
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
