import { computed, watch } from 'vue'
import { some } from 'lazy-collections'
import { createFocusable } from '@baleada/logic'
import { bind, on } from '../affordances'
import type { Popup } from '../extensions'
import { predicateEsc, predicateDown, predicateUp } from './predicateKeycombo'
import type { ElementApi } from './useElementApi'
import type { UseListFeaturesConfig } from './useListFeatures'

export function popupList (
  {
    controllerApis,
    popupApi,
    popup,
    getEscShouldClose,
    receivesFocus,
  }: {
    controllerApis: ElementApi<HTMLElement>[],
    popupApi: ElementApi<HTMLElement, true>,
    popup: Popup,
    getEscShouldClose: () => boolean,
    receivesFocus: UseListFeaturesConfig['receivesFocus'],
  }
) {
  const [primaryControllerApi] = controllerApis

  for (const controllerApi of controllerApis) {
    bind(
      controllerApi.element,
      {
        ariaExpanded: computed(() => `${popup.is.opened()}`),
        ariaControls: computed(() => (
          popup.is.opened()
            ? popupApi.id.value
            : undefined
        )),
      }
    )

    on(
      controllerApi.element,
      {
        focusout: event => {
          if (
            popup.is.closed()
            || some<typeof controllerApis[number]>(
              controllerApi => controllerApi.element.value.contains(event.relatedTarget as HTMLElement)
            )(controllerApis) as boolean
            || popupApi.element.value.contains(event.relatedTarget as HTMLElement)
          ) return

          popup.close()
        },
        keydown: event => {
          if (
            popup.is.closed()
            && (predicateDown(event) || predicateUp(event))
          ) {
            popup.open()

            if (receivesFocus) return

            primaryControllerApi.element.value.focus()
            return
          }

          if (popup.is.opened() && predicateEsc(event)) {
            popup.close()
            return
          }
        },
      }
    )
  }

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

          popup.close()

          if (popup.is.removed()) {
            primaryControllerApi.element.value.focus()
            return
          }

          const stop = watch(
            () => popup.is.removed(),
            is => {
              if (!is) return

              stop()
              primaryControllerApi.element.value.focus()
            }
          )
        },
      }
    )

    on(
      popupApi.element,
      {
        focusout: event => {
          if (
            some<typeof controllerApis[number]>(
              controllerApi => controllerApi.element.value.contains(event.relatedTarget as HTMLElement)
            )(controllerApis) as boolean
            || popupApi.element.value.contains(event.relatedTarget as HTMLElement)
          ) return

          // Account for portaled content
          if (event.relatedTarget === createFocusable('previous')(popupApi.element.value)) {
            event.preventDefault()
            primaryControllerApi.element.value.focus()
            return
          }

          popup.close() // TODO: dynamic list changes while open can cause this to close when it probably shouldn't
        },
      }
    )
  }
}
