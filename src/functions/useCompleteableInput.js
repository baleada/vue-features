import { ref, isRef, computed, watch, onMounted, nextTick } from 'vue'
import { useCompleteable, useListenable } from '@baleada/vue-composition'

// Put in a completeable instance ref and a ref to an input or textarea. TODO: add support for contenteditable div, probably using Selection API
export default function useCompleteableInput ({ completeable: completeableRefOrConstructorArgs, input: element }) {
  const completeable = isRef(completeableRefOrConstructorArgs) ? completeableRefOrConstructorArgs : useCompleteable(...completeableRefOrConstructorArgs),
        inputStatus = ref('ready'), // ready|focusing|focused|blurring|blurred
        valueStatus = ref('ready'), // ready|selecting|selected
        arrowStatus = ref('ready'), // ready|unhandled|handled
        completeableChangeAgent = ref('program') // program|event

  // Define handler logic
  function inputHandle (event) {
    switch (valueStatus.value) {
    case 'selecting':
      break
    case 'ready':
    case 'selected':
      completeableChangeAgent.value = 'event'

      const { target: { value, selectionStart: start, selectionEnd: end, selectionDirection: direction } } = event
      completeable.value.setString(value)
      completeable.value.setSelection({ start, end, direction })

      nextTick(() => (completeableChangeAgent.value = 'program'))
    }
  }
  
  function selectHandle (event) {
    switch (valueStatus.value) {
    case 'ready':
      // unreachable
      break
    case 'selecting':
      nextTick(() => (valueStatus.value = 'selected'))
      break
    case 'selected':
      const { target: { selectionStart: start, selectionEnd: end, selectionDirection: direction } } = event
      completeable.value.setSelection({ start, end, direction })
      break
    }
  }

  function mouseupHandle (event) {
    const { target: { selectionStart: start, selectionEnd: end, selectionDirection: direction } } = event

    switch (inputStatus.value) {
    case 'ready':
    case 'blurred':
      inputStatus.value = 'focused'
      nextTick(() => completeable.value.setSelection({ start, end, direction }))
      break
    case 'focused':
      nextTick(() => completeable.value.setSelection({ start, end, direction }))  
      break
    }      
  }

  function arrowKeyupHandle (event) {
    const { shiftKey, target: { selectionStart: start, selectionEnd: end, selectionDirection: direction } } = event
    if (!shiftKey) {
      completeable.value.setSelection({ start, end, direction })
    }
  }

  function arrowKeydownHandle (event) {
    const { metaKey } = event
    if (metaKey) {
      arrowStatus.value = 'unhandled'
    }
  }

  function metaHandle (event) {
    const { shiftKey, target: { selectionStart: start, selectionEnd: end, selectionDirection: direction } } = event
    if (!shiftKey) {
      switch (arrowStatus.value) {
      case 'ready':
      case 'handled':
        // do nothing
        break
      case 'unhandled':
        arrowStatus.value = 'handled'
        completeable.value.setSelection({ start, end, direction })
      }
      completeable.value.setSelection({ start, end, direction })
    }
  }

  function focusHandle ({ target: { selectionStart: start, selectionEnd: end, selectionDirection: direction } }) {
    switch (inputStatus.value) {
    case 'ready':
    case 'blurred':
      switch (valueStatus.value) {
      case 'selecting':
        // do nothing
        break
      case 'ready':
      case 'selected':
        inputStatus.value = 'focused'
        const { target: { selectionStart: start, selectionEnd: end, selectionDirection: direction } } = event
        completeable.value.setSelection({ start, end, direction })
        break
      }
      nextTick(() => (inputStatus.value = 'focused'))
      break
    case 'focused':
      // unreachable
      break
    }
  }

  function blurHandle () {
    inputStatus.value = 'blurred'
  }

  // Set up listenables
  const input = useListenable('input'),
        select = useListenable('select'),
        mouseup = useListenable('mouseup'),
        arrowKeyup = useListenable('arrow', { keycombo: 'up' }),
        arrowKeydown = useListenable('arrow'),
        meta = useListenable('cmd', { keycombo: 'up' }),
        focus = useListenable('focus'),
        blur = useListenable('blur'),
        listenables = [
          { listenable: input, handler: inputHandle },
          { listenable: select, handler: selectHandle },
          { listenable: mouseup, handler: mouseupHandle },
          { listenable: arrowKeyup, handler: arrowKeyupHandle },
          { listenable: arrowKeydown, handler: arrowKeydownHandle },
          { listenable: meta, handler: metaHandle },
          { listenable: focus, handler: focusHandle },
          { listenable: blur, handler: blurHandle },
        ]

  onMounted(() => {
    listenables.forEach(({ listenable, handler }) => {
      listenable.value.listen(handler, { target: element.value })
    })
  })
  
  
  // Sync input selection with completeable selection
  watch(
    () => completeable.value.selection,
    () => nextTick(() => {
      if (element.value !== null) {
        switch (inputStatus.value) {
        case 'ready':
        case 'blurred':
          // Completeable was changed by a button click
          valueStatus.value = 'selecting'
          inputStatus.value = 'focusing'
          element.value.focus()
          element.value.setSelectionRange(
            completeable.value.selection.start,
            completeable.value.selection.end,
            completeable.value.selection.direction,
          )
          break
        case 'focused':
          // Completeable was changed by an input event or a keycombo
          valueStatus.value = 'selecting'
          element.value.setSelectionRange(
            completeable.value.selection.start,
            completeable.value.selection.end,
            completeable.value.selection.direction,
          )
          break
        }
      }
    })
  )

  return {
    completeable,
    status: computed(() => ({
      input: inputStatus.value,
      arrow: arrowStatus.value,
      value: valueStatus.value,
    })),
    completeableChangeAgent,
  }
}
