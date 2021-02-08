// https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_modal

// TODO: Support drawers


export default function useModalDrawer ({ initialStatus }, options = {}) {
  // TARGETS
  const root = useTarget('single'),
        dialog = useTarget('single'),
        firstFocusable = useTarget('single'),
        lastFocusable = useTarget('single')

  
  // STATUS
  const status = ref(initialStatus)



  // DRAWER OFFSET


  // DRAWER FRAME


  // WAI ARIA BASICS

  useListenables({
    target: firstFocusable.target,
    listenable: {
      'shift+tab': event => {
        event.preventDefault()
        lastFocusable.target.value.focus()
      }
    }
  })

  useListenables({
    target: lastFocusable.target,
    listenable: {
      tab: event => {
        event.preventDefault()
        firstFocusable.target.value.focus()
      }
    }
  })


  return {
    root: root.handle,
    dialog: dialog.handle,
    focusable: {
      first: firstFocusable.handle,
      last: lastFocusable.handle,
    },
    status,
    offset,
    frame,
  }
}
