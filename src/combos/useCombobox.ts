import { ref, watch, computed, nextTick } from 'vue'
import { some } from 'lazy-collections'
import { createOmit } from '@baleada/logic'
import type { Completeable } from '@baleada/logic'
import { createMap } from '@baleada/logic'
import {
  useTextbox,
  useButton,
  useListbox,
} from '../interfaces'
import type {
  Textbox,
  UseTextboxOptions,
  Button,
  UseButtonOptions,
  Listbox,
  UseListboxOptions,
} from '../interfaces'
import { bind, on, popupController } from  '../affordances'
import { usePopup } from '../extensions'
import type { Popup, UsePopupOptions } from '../extensions'
import {
  useListWithEvents,
  popupList,
  predicateEsc,
} from '../extracted'

export type Combobox = {
  textbox: Textbox,
  button: Button<true>,
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
  button?: UseButtonOptions<true>,
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
    button: buttonOptions,
    listbox: listboxOptions,
    popup: popupOptions,
  } = { ...defaultOptions, ...options }


  // INTERFACES
  const textbox = useTextbox(textboxOptions),
        button = useButton({ ...buttonOptions, toggles: true }),
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
    button.status,
    status => {
      switch (status) {
        case 'on':
          popup.open()
          break
        case 'off':
          popup.close()
          break
      }
    }
  )

  watch(
    listbox.results,
    results => {
      if (
        popup.is.opened()
        || some<typeof results[number]>(
          ({ score }) => score >= queryMatchThreshold
        )(results)
      ) return

      popup.close()
    }
  )

  popupList({
    controllerApis: [textbox.root, button.root],
    popupApi: listbox.root,
    popup,
    getEscShouldClose: () => true,
    receivesFocus: false,
  })


  // BUTTON
  watch(
    popup.status,
    status => {
      switch (status) {
        case 'opened':
          button.on()
          break
        case 'closed':
          button.off()
          break
      }
    }
  )

  
  // LISTBOX OPTION ABILITY
  const ability = ref<typeof listbox['options']['meta']['value'][0]['ability'][]>([])

  watch(
    listbox.results,
    results => {
      if (results.length === 0) {
        ability.value = toAllDisabled(listbox.options.list.value)
        return
      }

      ability.value = createMap<typeof results[number], typeof ability['value'][0]>(
        ({ score }) => score >= queryMatchThreshold ? 'enabled' : 'disabled'
      )(results)
    }
  )


  // SEARCH
  const queryMatchThreshold = listboxOptions?.queryMatchThreshold ?? 1

  
  // MULTIPLE CONCERNS
  const complete: Combobox['complete'] = (...params) => {
          textbox.text.complete(...params)
          nextTick(popup.close)
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
        }),
        pasteAndSearch = () => {
          listbox.paste(textbox.text.string)
          listbox.search()
        },
        toCandidate = (index: number) => (
          listbox.options.meta.value[index].candidate
          || listbox.options.list.value[index].textContent
        )

  watch(
    () => textbox.text.string,
    string => {
      if (!string) listbox.deselect.all()

      const effect = string
        ? pasteAndSearch
        : () => ability.value = toAllEnabled(listbox.options.list.value)

      if (popup.is.opened()) {
        effect()
        return
      }

      const stop = watch(
        () => popup.is.opened(),
        is => {
          if (!is) return
          stop()
          effect()
        },
      )

      popup.open()
    }
  )

  watch(
    () => listbox.selected.newest,
    pick => {
      if (pick === undefined) return

      complete(
        listbox.options.meta.value[pick].candidate
        || listbox.options.list.value[pick].textContent,
        { select: 'completionEnd' }
      )
    },
    { flush: 'post' }
  )

  on(
    textbox.root.element,
    {
      focusout: () => {
        if (popup.is.closed()) return

        if (listbox.selected.picks.length) {
          complete(
            toCandidate(listbox.selected.newest),
            { select: 'completionEnd' }
          )
          return
        }

        complete('')
      },
      keydown: event => {
        if (!predicateEsc(event)) return
        complete('')
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
        popup.is.opened()
          ? listbox.options.ids.value[listbox.focused.location]
          : undefined
      )),
    }
  )

  
  // API
  return {
    textbox,
    button,
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
