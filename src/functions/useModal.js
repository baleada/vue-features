// https://www.w3.org/TR/wai-aria-practices-1.1/#dialog_modal
import { ref, computed } from 'vue'
import { useConditionalDisplay, useListenables, useBindings } from '../affordances'
import { useTarget, useLabel, useDescription } from '../util'

const defaultOptions = {
  initialStatus: 'closed',
}

export default function useModal (options = {}) {
  // OPTIONS
  const {
    initialStatus,
    transition,
  } = { ...defaultOptions, ...options }

  // TARGETS
  const root = useTarget('single'),
        dialog = useTarget('single'),
        firstFocusable = useTarget('single'),
        lastFocusable = useTarget('single')

  
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


  // DRAWER OFFSET
  const offset = ref(initialStatus === 'opened' ? 0 : 100)


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
      esc: event => {
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
    offset,
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
