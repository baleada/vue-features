import { ref, watch, computed } from 'vue'
import type { Ref } from 'vue'
import { createFocusable } from '@baleada/logic'
import type { ExtendableElement } from '../extracted'
import { narrowElement, predicateEsc } from '../extracted'
import { on } from '../affordances'
import {
  useRendering,
} from './useRendering'
import type { Rendering, UseRenderingOptions } from './useRendering'

export type Popup = {
  status: Ref<PopupStatus>,
  open: () => PopupStatus,
  close: () => PopupStatus,
  is: Rendering['is'] & {
    opened: () => boolean,
    closed: () => boolean,
  }
  renderingStatus: Rendering['status'],
}

type PopupStatus = 'opened' | 'closed'

export type UsePopupOptions = {
  initialStatus?: PopupStatus,
  rendering?: Omit<UseRenderingOptions, 'initialRenders'>,
}

const defaultOptions: UsePopupOptions = {
  initialStatus: 'closed',
}

export function usePopup (
  extendable: ExtendableElement,
  options: UsePopupOptions = {},
): Popup {
  // OPTIONS
  const {
    initialStatus,
    rendering: renderingOptions,
  } = { ...defaultOptions, ...options }


  // ELEMENTS
  const element = narrowElement(extendable)

  
  // STATUS
  const status: Popup['status'] = ref(initialStatus),
        open: Popup['open'] = () => status.value = 'opened',
        close: Popup['close'] = () => status.value = 'closed'

  on(
    element,
    {
      keydown: event => {
        if (predicateEsc(event)) {
          event.preventDefault()
          close()
        }
      },
    }
  )


  // RENDERING
  const rendering = useRendering(
    extendable,
    {
      ...renderingOptions,
      initialRenders: initialStatus === 'opened',
    }
  )

  watch(
    status,
    () => {
      switch (status.value) {
        case 'opened':
          rendering.render()
          break
        case 'closed':
          rendering.remove()
          break
      }
    }
  )

  
  // FOCUS MANAGEMENT
  const toFirstFocusable = createFocusable('first'),
        toLastFocusable = createFocusable('last')

  on(
    element,
    {
      focusout: event => {
        if (
          event.target === toFirstFocusable(element.value)
          && (
            !element.value.contains(event.relatedTarget as HTMLElement)
            || event.relatedTarget === element.value
          )
        ) {
          event.preventDefault()
          toLastFocusable(element.value).focus()
          return
        }

        if (
          event.target === toLastFocusable(element.value)
          && !element.value.contains(event.relatedTarget as HTMLElement)
        ) {
          event.preventDefault()
          toFirstFocusable(element.value).focus()
          return
        }
      },
    }
  )

  
  // API
  return {
    status: computed(() => status.value),
    open,
    close,
    is: {
      opened: () => status.value === 'opened',
      closed: () => status.value === 'closed',
      ...rendering.is,
    },
    renderingStatus: rendering.status,
  }  
}
