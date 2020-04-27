import { ref, isRef, computed, watch, onMounted } from '@vue/composition-api'
import { useCompleteable, useListenable } from '@baleada/vue-composition'

// Put in a completeable instance ref and a ref to an input or textarea. TODO: add support for contenteditable div, probably using Selection API
export default function useCompleteableElement ({ completeable: completeableRefOrConstructorArgs, element }) {
  const completeable = isRef(completeableRefOrConstructorArgs) ? completeableRefOrConstructorArgs : useCompleteable(...completeableRefOrConstructorArgs),
        inputStatus = ref('ready'), // ready|focused|blurred
        valueStatus = ref('ready'), // ready|selecting|selected
        arrowStatus = ref('ready') // ready|pressed|handled

  // Define handler logic
  function handleInput (event) {
    const { target: { value, selectionStart: start, selectionEnd: end, selectionDirection: direction } } = event
    completeable.value.setString(value)
    completeable.value.setSelection({ start, end, direction })
  }
  
  function handleSelect (event) {
    switch (valueStatus.value) {
    case 'ready':
      // unreachable
      break
    case 'selecting':
      // do nothing. This event was triggered programmatically, not by the user.
      break
    case 'selected':
      const { target: { selectionStart: start, selectionEnd: end, selectionDirection: direction } } = event
      completeable.value.setSelection({ start, end, direction })
      break
    }
  }

  function handleMouseup (event) {
    const { target: { selectionStart: start, selectionEnd: end, selectionDirection: direction } } = event

    switch (inputStatus.value) {
    case 'ready':
    case 'blurred':
      inputStatus.value = 'focused'
      nextTick(completeable.value.setSelection({ start, end, direction }))
      break
    case 'focused':
      nextTick(completeable.value.setSelection({ start, end, direction }))  
      break
    }      
  }

  function handleArrowKeyup (event) {
    const { shiftKey, metaKey, target: { selectionStart: start, selectionEnd: end, selectionDirection: direction } } = event
    if (!shiftKey) { // Breaks for remapped keyboards :'(
      completeable.value.setSelection({ start, end, direction })
    }
  }

  function handleArrowKeydown (event) {
    const { metaKey } = event
    if (metaKey) {
      arrowStatus.value = 'unhandled'
    }
  }

  function handleMeta (event) {
    const { shiftKey, target: { selectionStart: start, selectionEnd: end, selectionDirection: direction } } = event
    if (!shiftKey) { // Breaks for remapped keyboards :'(
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

  function handleFocus ({ target: { selectionStart: start, selectionEnd: end, selectionDirection: direction } }) {
    switch (inputStatus.value) {
    case 'ready':
    case 'blurred':
      switch (valueStatus.value) {
      case 'selecting':
        // do nothing. This event was triggered programmatically, not by the user.
        break
      case 'ready':
      case 'selected':
        inputStatus.value = 'focused'
        const { target: { selectionStart: start, selectionEnd: end, selectionDirection: direction } } = event
        completeable.value.setSelection({ start, end, direction })
        break
      }
      break
    case 'focused':
      // unreachable
      break
    }
  }

  function handleBlur () {
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
          { listenable: input, handler: handleInput },
          { listenable: select, handler: handleSelect },
          { listenable: mouseup, handler: handleMouseup },
          { listenable: arrowKeyup, handler: handleArrowKeyup },
          { listenable: arrowKeydown, handler: handleArrowKeydown },
          { listenable: meta, handler: handleMeta },
          { listenable: focus, handler: handleFocus },
          { listenable: blur, handler: handleBlur },
        ]

  onMounted(() => {
    listenables.forEach(({ listenable, handler }) => {
      listenable.value.listen(handler, { target: element.value })
    })
  })
  
  
  // Sync input selection with completeable selection
  watch(
    () => completeable.value.selection.start + completeable.value.selection.end,
    () => {
      if (element.value !== null) {
        switch (inputStatus.value) {
        case 'ready':
        case 'blurred':
          // Completeable was changed by a button click
          valueStatus.value = 'selecting'
          element.value.focus()
          element.value.setSelectionRange(
            completeable.value.selection.start,
            completeable.value.selection.end,
            completeable.value.selection.direction,
          )
          nextTick(() => (valueStatus.value = 'selected'))
          break
        case 'focused':
          // Completeable was changed by an input event or a keycombo
          valueStatus.value = 'selecting'
          element.value.setSelectionRange(
            completeable.value.selection.start,
            completeable.value.selection.end,
            completeable.value.selection.direction,
          )
          nextTick(() => (valueStatus.value = 'selected'))
          break
        }
      }
    }
  )

  return {
    completeable: computed(() => completeable.value),
    status: computed(() => ({
      input: inputStatus.value,
      arrow: arrowStatus.value,
      value: valueStatus.value,
    })),
  }
}

function nextTick (callback) {
  setTimeout(callback, 0)
}