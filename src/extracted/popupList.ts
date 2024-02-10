import { computed, watch } from 'vue'
import { createFocusable } from '@baleada/logic'
import { bind, on } from '../affordances'
import type { Popup } from '../extensions'
import { predicateEsc } from './predicateKeycombo'
import type { ElementApi } from './useElementApi'
import type { UseListFeaturesConfig } from './useListFeatures'

export function popupList (
  {
    controllerApi,
    popupApi,
    popup,
    getEscShouldClose,
    receivesFocus,
  }: {
    controllerApi: ElementApi<HTMLElement>,
    popupApi: ElementApi<HTMLElement, true>,
    popup: Popup,
    getEscShouldClose: () => boolean,
    receivesFocus: UseListFeaturesConfig['receivesFocus'],
  }
) {
  bind(
    controllerApi.element,
    {
      ariaExpanded: computed(() => `${popup.is.opened()}`),
      ariaControls: computed(() =>
        popup.is.opened() // TODO: combobox also had `textbox.text.string.length > 0` here, why?
          ? popupApi.id.value
          : undefined
      ),
    }
  )

  on(
    controllerApi.element,
    {
      focusout: event => {
        if (
          popup.is.closed()
          || popupApi.element.value.contains(event.relatedTarget as HTMLElement)
        ) return

        popup.close()
      },
    }
  )

  if (receivesFocus) {
    on(
      popupApi.element,
      {
        keydown: event => {
          if (
            !predicateEsc(event)
            || !getEscShouldClose()
          ) return
  
          event.preventDefault()
  
          const stop = watch(
            () => popup.is.removed(),
            is => {
              if (!is) return
              
              stop()
              controllerApi.element.value.focus()
            }
          )
  
          popup.close()
        },
      }
    )
  
    on(
      popupApi.element,
      {
        focusout: event => {
          if (
            controllerApi.element.value.contains(event.relatedTarget as HTMLElement)
            || popupApi.element.value.contains(event.relatedTarget as HTMLElement)
          ) return
  
          // Account for portaled content
          if (event.relatedTarget === createFocusable('previous')(popupApi.element.value)) {
            event.preventDefault()
            controllerApi.element.value.focus()
            return
          }
  
          popup.close() // TODO: dynamic list changes while open can cause this to close when it probably shouldn't
        },
      }
    )
  }
}
