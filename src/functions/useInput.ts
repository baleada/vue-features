import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import { useCompleteable } from '@baleada/vue-composition'
import type { Completeable, CompleteableOptions } from '@baleada/logic'
import { on, model } from '../affordances'
import { useSingleElement } from '../extracted'
import type { SingleElement } from '../extracted'

export type Input = {
  root: SingleElement<HTMLInputElement>,
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
  const root = useSingleElement<HTMLInputElement>()

  
  // COMPLETEABLE
  const completeable = useCompleteable(initialValue, completeableOptions),
        selectionEffect = (event: Event | KeyboardEvent) => completeable.value.setSelection({
          start: (event.target as HTMLInputElement).selectionStart,
          end: (event.target as HTMLInputElement).selectionEnd,
          direction: (event.target as HTMLInputElement).selectionDirection,
        }),
        arrowStatus: Ref<'ready' | 'unhandled' | 'handled'> = ref('ready')

  watch(
    () => completeable.value.selection,
    () => {
      (root.element.value as HTMLInputElement).setSelectionRange(
        completeable.value.selection.start,
        completeable.value.selection.end,
        completeable.value.selection.direction,
      )
    },
    { flush: 'post' }
  )

  on<'select' | 'focus' | 'pointerup' | '+arrow' | '+cmd'>({
    element: root.element,
    effects: defineEffect => [
      defineEffect(
        'select',
        event => {
          event.preventDefault()
          selectionEffect(event)
        },
      ),
      defineEffect(
        'focus',
        () => completeable.value.setSelection({ start: 0, end: completeable.value.string.length, direction: 'forward' })
      ),
      defineEffect(
        'pointerup',
        selectionEffect
      ),
      defineEffect(
        'arrow' as '+arrow',
        {
          createEffect: () => event => {
            if (!event.shiftKey) {
              selectionEffect(event)
            }
          },
          options: {
            listen: { keyDirection: 'up' },
          },
        }
      ),
      // Same keycombo, but keydown instead of keyup
      defineEffect(
        'arrow' as '+arrow',
        event => {
          if (!event.metaKey) {
            arrowStatus.value = 'unhandled'
          }
        }
      ),
      defineEffect(
        'cmd' as '+cmd',
        {
          createEffect: () => event => {
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
        }
      )
    ],
  })
  
  model(
    {
      element: root.element,
      value: computed({
        get: () => completeable.value.string,
        set: string => completeable.value.string = string
      })
    },
    {
      toValue: event => {
        // Not a huge fan of performing side effects in a transform function like this,
        // but it's too convenient to pass up.
        selectionEffect(event)
        return (event.target as HTMLInputElement).value
      }
    }
  )


  // API
  return {
    root,
    completeable,
  }
}
