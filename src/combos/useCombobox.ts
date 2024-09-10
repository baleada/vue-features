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
import {
  bind,
  on,
  popupController,
  virtualFocusTarget,
} from  '../affordances'
import type { VirtualFocusTargetOptions } from '../affordances'
import { usePopup } from '../extensions'
import type { Popup, UsePopupOptions } from '../extensions'
import {
  popupList,
  predicateEsc,
} from '../extracted'
import type { Ability, SupportedElement } from '../extracted'
import { createMultiRef } from '../transforms'

export type Combobox = {
  textbox: Textbox,
  button: Button<true>,
  listbox: (
    & Listbox<false, 'vertical'>
    & Omit<Popup, 'status' | 'toggle'>
    & {
      is: Listbox<false>['is'] & Popup['is'],
      popupStatus: Popup['status'],
      togglePopupStatus: Popup['toggle'],
    }
  ),
  complete: (...params: Parameters<Completeable['complete']>) => void,
}

export type UseComboboxOptions = {
  textbox?: UseTextboxOptions,
  button?: UseButtonOptions<true>,
  listbox?: Omit<
    UseListboxOptions<false, true, 'vertical'>,
    | 'clears'
    | 'disabledOptionsReceiveFocus'
    | 'initialSelected'
    | 'multiselectable'
    | 'orientation'
    | 'selectsOnFocus'
    | 'receivesFocus'
  >,
  popup?: UsePopupOptions,
  virtualFocusTarget?: VirtualFocusTargetOptions,
}

const defaultOptions: UseComboboxOptions = {}

export function useCombobox (options: UseComboboxOptions = {}): Combobox {
  // OPTIONS
  const {
    textbox: textboxOptions,
    button: buttonOptions,
    listbox: listboxOptions,
    popup: popupOptions,
    virtualFocusTarget: virtualFocusTargetOptions,
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
          initialKeyboardStatus: 'focusing',
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
  const queryMatchThreshold = listboxOptions?.query?.matchThreshold ?? 1


  // MULTIPLE CONCERNS
  const complete: Combobox['complete'] = (completion, options) => {
          previousCompletion = completion
          textbox.text.complete(completion, options)
          nextTick(popup.close)
        },
        pasteAndSearch = () => {
          if (!popup.is.opened()) return
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
        { flush: 'post' },
      )

      popup.open()
    }
  )

  // TODO: Unless options are virtualized, it's impossible
  // to programmatically select while the popup is closed
  watch(
    () => listbox.selectedOptions.newest,
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
          ? listbox.options.ids.value[listbox.focused.value]
          : undefined
      )),
    }
  )

  virtualFocusTarget(listbox, virtualFocusTargetOptions)


  // API
  return {
    textbox: {
      ...textbox,
      root: {
        ...textbox.root,
        ref: meta => createMultiRef(
          textbox.root.ref(meta),
          listbox.keyboardTarget.ref({
            ...meta,
            targetability: popup.is.opened() ? 'targetable' : 'untargetable',
          }),
        ),
      },
    },
    button,
    listbox: {
      ...listbox,
      ...createOmit<Popup, 'status' | 'toggle'>(['status', 'toggle'])(popup),
      options: {
        ...listbox.options,
        ref: (index, meta) => listbox.options.ref(index, {
          ...meta,
          ability: (
            abilities.value[index] === 'disabled'
            || meta?.ability === 'disabled'
          )
            ? 'disabled'
            : 'enabled',
        }),
      },
      is: {
        ...listbox.is,
        ...popup.is,
      },
      popupStatus: popup.status,
      togglePopupStatus: popup.toggle,
    },
    complete,
  }
}

const toAllEnabled = createMap<SupportedElement, 'enabled'>(() => 'enabled')
