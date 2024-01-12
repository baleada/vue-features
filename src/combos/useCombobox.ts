import { ref, watch, computed, nextTick } from 'vue'
import { findIndex, some } from 'lazy-collections'
import type { MatchData } from 'fast-fuzzy'
import type { Completeable } from '@baleada/logic'
import { createFilter, createMap } from '@baleada/logic'
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
  predicateEnter,
  predicateBackspace,
} from '../extracted'

export type Combobox = {
  textbox: Textbox,
  listbox: (
    & Listbox<false>
    & {
      is: Listbox<false>['is'] & Popup['is'],
      popupStatus: Popup['status'],
    } 
  ),
  complete: (...params: Parameters<Completeable['complete']>) => void,
}

export type UseComboboxOptions = {
  textbox?: UseTextboxOptions,
  listbox?: UseListboxOptions<false, true>,
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
          ...(listboxOptions as UseListboxOptions<false, true>),
          initialSelected: 'none',
          transfersFocus: false,
          disabledOptionsReceiveFocus: false,
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
            if (is) {
              stop()
              ability.value = toAllEnabled(listbox.options.list.value)
            }
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

  
  // LIST FEATURES
  useListWithEvents({
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
    transfersFocus: false,
    multiselectable: false,
    preventSelectOnFocus: () => {},
    allowSelectOnFocus: () => {},
    selectsOnFocus: false,
    clears: true,
    getAbility: index => listbox.options.meta.value[index].ability,
  })


  // BASIC BINDINGS
  bind(
    textbox.root.element,
    {
      role: 'combobox',
      ariaAutocomplete: 'list',
      ariaHaspopup: 'listbox',
      ariaExpanded: computed(() => `${popup.is.opened()}`),
      ariaControls: computed(() => (
        popup.is.opened() && textbox.text.string.length > 0
          ? listbox.root.id.value
          : undefined
      )),
      ariaActivedescendant: computed(() => (
        popup.is.opened() && textbox.text.string.length > 0
          ? listbox.options.ids.value[listbox.focused.location]
          : undefined
      )),
    }
  )


  // MULTIPLE CONCERNS
  const complete: Combobox['complete'] = (...params) => {
          textbox.text.complete(...params)
          nextTick(() => requestAnimationFrame(() => {
            popup.close()
          }))
        }

  on(
    textbox.root.element,
    {
      focusout: () => {
        if (!textbox.is.valid()) complete('')
        popup.close()
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
          popup.is.opened()
          && predicateEnter(event)
          && toEnabled(ability.value).length === 1
          && (findIndex<typeof ability['value'][0]>(a => a === 'enabled')(ability.value) as number) === listbox.selected.newest
        ) {
          // Force reselect
          const selected = listbox.selected.newest
          listbox.deselect.all()
          listbox.select.exact(selected) // TODO nexttick removed why?
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
  
  // API
  return {
    textbox,
    listbox: {
      ...listbox,
      options: {
        ...listbox.options,
        ref: (index, meta) => listbox.options.ref(index, {
          ...meta,
          ability: (ability.value[index] === 'disabled' || meta?.ability === 'disabled')
            ? 'disabled'
            : 'enabled',
        }),
      },
      is: {
        ...listbox.is,
        ...popup.is,
      },
      popupStatus: popup.status,
    },
    complete,
  }
}

const toAllDisabled = createMap<HTMLElement, 'disabled'>(() => 'disabled'),
      toAllEnabled = createMap<HTMLElement, 'enabled'>(() => 'enabled'),
      toEnabled = createFilter<'enabled' | 'disabled'>(a => a === 'enabled')
