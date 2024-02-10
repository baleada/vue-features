import { ref, watch, computed, nextTick } from 'vue'
import { some } from 'lazy-collections'
import type { MatchData } from 'fast-fuzzy'
import { createOmit } from '@baleada/logic'
import type { Completeable } from '@baleada/logic'
import { createMap } from '@baleada/logic'
import { useTextbox, useListbox } from '../interfaces'
import type {
  Textbox,
  UseTextboxOptions,
  Listbox,
  UseListboxOptions,
} from '../interfaces'
import { bind, on, popupController } from  '../affordances'
import { usePopup } from '../extensions'
import type { Popup, UsePopupOptions } from '../extensions'
import {
  useListWithEvents,
  predicateDown,
  predicateEsc,
  predicateBackspace,
  popupList,
} from '../extracted'

export type Combobox = {
  textbox: Textbox,
  listbox: (
    & Listbox<false>
    & Omit<Popup, 'status'>
    & {
      is: Listbox<false>['is'] & Popup['is'],
      popupStatus: Popup['status'],
    } 
  ),
  complete: (...params: Parameters<Completeable['complete']>) => void,
}

export type UseComboboxOptions = {
  textbox?: UseTextboxOptions,
  listbox?: Omit<
    UseListboxOptions<false, true>,
    | 'clears'
    | 'disabledOptionsReceiveFocus'
    | 'initialSelected'
    | 'multiselectable'
    | 'orientation'
    | 'selectsOnFocus'
    | 'receivesFocus'
  >,
  popup?: UsePopupOptions,
}

const defaultOptions: UseComboboxOptions = {}

export function useCombobox (options: UseComboboxOptions = {}): Combobox {
  // OPTIONS
  const {
    textbox: textboxOptions,
    listbox: listboxOptions,
    popup: popupOptions,
  } = { ...defaultOptions, ...options }


  // INTERFACES
  const textbox = useTextbox(textboxOptions),
        listbox = useListbox({
          ...listboxOptions,
          clears: true,
          disabledOptionsReceiveFocus: false,
          initialSelected: 'none',
          multiselectable: false,
          orientation: 'vertical',
          selectsOnFocus: false,
          receivesFocus: false,
        })

  
  // POPUP
  popupController(textbox.root.element, { has: 'listbox' })
  const popup = usePopup(listbox, popupOptions)

  watch(
    () => textbox.text.string,
    () => {
      if (!textbox.text.string) return
      
      // Wait for validity to update
      nextTick(() => {
        if (textbox.is.valid()) {
          popup.close()
          return
        }
  
        popup.open()
        nextTick(() => {
          listbox.paste(textbox.text.string)
          listbox.search()
        })
      })
    },
  )

  watch(
    () => listbox.results.value,
    () => {
      if (
        popup.is.opened()
        || some<MatchData<string>>(
          ({ score }) => score >= queryMatchThreshold
        )(listbox.results.value)
      ) return

      popup.close()
    }
  )

  popupList({
    controllerApi: textbox.root,
    popupApi: listbox.root,
    popup,
    getEscShouldClose: () => true,
    receivesFocus: false,
  })

  
  // LISTBOX OPTION ABILITY
  const ability = ref<typeof listbox['options']['meta']['value'][0]['ability'][]>([])

  watch(
    () => textbox.text.string,
    () => {
      if (!textbox.text.string) {
        if (popup.is.opened()) {
          ability.value = toAllEnabled(listbox.options.list.value)
          return
        }

        const stop = watch(
          () => popup.is.opened(),
          is => {
            if (!is) return
            stop()
            ability.value = toAllEnabled(listbox.options.list.value)
          },
        )
      }
    }
  )

  watch(
    () => listbox.results.value,
    () => {
      if (listbox.results.value.length === 0) {
        ability.value = toAllDisabled(listbox.options.list.value)
        return
      }

      ability.value = createMap<MatchData<string>, typeof ability['value'][0]>(
        ({ score }) => score >= queryMatchThreshold ? 'enabled' : 'disabled'
      )(listbox.results.value as MatchData<string>[])
    }
  )


  // SEARCH
  const queryMatchThreshold = listboxOptions?.queryMatchThreshold ?? 1

  
  // MULTIPLE CONCERNS
  const complete: Combobox['complete'] = (...params) => {
          textbox.text.complete(...params)
          nextTick(() => requestAnimationFrame(() => { // TODO: timing
            popup.close()
          }))
        },
        withEvents = useListWithEvents({
          keyboardElement: textbox.root.element,
          pointerElement: listbox.root.element,
          getIndex: () => listbox.focused.location,
          focus: listbox.focus,
          focused: listbox.focused,
          select: listbox.select,
          selected: listbox.selected,
          deselect: listbox.deselect,
          predicateSelected: listbox.is.selected,
          query: computed(() => textbox.text.string + ' '), // Force disable spacebar handling
          orientation: 'vertical',
          multiselectable: false,
          preventSelectOnFocus: () => {},
          allowSelectOnFocus: () => {},
          selectsOnFocus: false,
          clears: true,
          getAbility: index => listbox.options.meta.value[index].ability,
        })

  on(
    textbox.root.element,
    {
      focusout: () => {
        if (textbox.is.valid()) return
        complete('')
      },
      keydown: event => {
        if (popup.is.closed() && predicateDown(event)) {
          popup.open()
          return
        }

        if (popup.is.opened() && predicateEsc(event)) {
          popup.close()
          return
        }

        if (
          textbox.text.string.length
          && textbox.text.selection.end - textbox.text.selection.start === textbox.text.string.length
          && predicateBackspace(event)
        ) {
          popup.open()
          return
        }
      },
    }
  )


  // BASIC BINDINGS
  bind(
    textbox.root.element,
    {
      role: 'combobox',
      ariaAutocomplete: 'list',
      ariaActivedescendant: computed(() => (
        popup.is.opened() // TODO: why remove `textbox.text.string.length > 0`? Maybe react aria thing?
          ? listbox.options.ids.value[listbox.focused.location]
          : undefined
      )),
    }
  )

  
  // API
  return {
    textbox,
    listbox: {
      ...listbox,
      ...createOmit<Popup, 'status'>(['status'])(popup),
      options: {
        ...listbox.options,
        ref: (index, meta) => listbox.options.ref(index, {
          ...meta,
          ability: (ability.value[index] === 'disabled' || meta?.ability === 'disabled')
            ? 'disabled'
            : 'enabled',
        }),
      },
      ...withEvents,
      is: {
        ...listbox.is,
        ...withEvents.is,
        ...popup.is,
      },
      popupStatus: popup.status,
    },
    complete,
  }
}

const toAllDisabled = createMap<HTMLElement, 'disabled'>(() => 'disabled'),
      toAllEnabled = createMap<HTMLElement, 'enabled'>(() => 'enabled')
