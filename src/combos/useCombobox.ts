import { ref, watch, computed, nextTick } from 'vue'
import { some } from 'lazy-collections'
import type { MatchData } from 'fast-fuzzy'
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
import type { Ability } from '../extracted'
import { createToNextEligible, createToPreviousEligible } from '../extracted/createToEligibleInList'

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

  
  // ABILITIES
  const abilities = ref<Ability[]>([]),
        toAbilities = createMap<MatchData<string>, Ability>(
          ({ score }) => (
            score >= queryMatchThreshold
              ? 'enabled'
              : 'disabled'
          )
        )

  watch(
    listbox.results,
    results => abilities.value = toAbilities(results)
  )


  // SEARCH
  const queryMatchThreshold = listboxOptions?.queryMatchThreshold ?? 1

  
  // MULTIPLE CONCERNS
  const complete: Combobox['complete'] = (completion, options) => {
          previousCompletion = completion
          textbox.text.complete(completion, options)
          nextTick(popup.close)
        },
        toNextEligible = createToNextEligible({ api: listbox.options }),
        toPreviousEligible = createToPreviousEligible({ api: listbox.options }),
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
          preventSelect: () => {},
          allowSelect: () => {},
          selectsOnFocus: false,
          clears: true,
          toAbility: index => listbox.options.meta.value[index].ability,
          toNextEligible,
          toPreviousEligible,
        }),
        pasteAndSearch = () => {
          listbox.paste(textbox.text.string)
          listbox.search()
        },
        toCandidate = (index: number) => (
          listbox.options.meta.value[index].candidate
          || listbox.options.list.value[index].textContent
        )

  let previousCompletion = ''

  watch(
    () => textbox.text.string,
    string => {
      if (!string) {
        previousCompletion = ''
        listbox.deselect.all()
      }

      const effect = string
        ? pasteAndSearch
        : () => abilities.value = toAllEnabled(listbox.options.list.value)

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

  // TODO: Unless options are passed in some other way, it's impossible
  // to programmatically select while the popup is closed
  watch(
    () => listbox.selected.newest,
    pick => {
      if (pick === undefined) return

      complete(
        toCandidate(pick),
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
        complete(previousCompletion, { select: 'completionEnd' })
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
          ability: (abilities.value[index] === 'disabled' || meta?.ability === 'disabled')
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

const toAllEnabled = createMap<HTMLElement, 'enabled'>(() => 'enabled')
