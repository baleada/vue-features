import { ref, watch, computed, nextTick, onMounted } from 'vue'
import type { WatchSource } from 'vue'
import { some } from 'lazy-collections'
import type { MatchData } from 'fast-fuzzy'
import type { Completeable } from '@baleada/logic'
import { useTextbox, useListbox } from '../interfaces'
import type { Textbox, UseTextboxOptions, Listbox, UseListboxOptions } from "../interfaces"
import { bind, on } from  '../affordances'
import { ensureGetStatus, focusedAndSelectedOn } from '../extracted'

export type Combobox = {
  textbox: Textbox,
  listbox: Listbox<false, true>,
  complete: (...params: Parameters<Completeable['complete']>) => void,
}

export type UseComboboxOptions = {
  textbox?: UseTextboxOptions,
  listbox?: UseListboxOptions<false, true>,
}

const defaultOptions: UseComboboxOptions = {
  textbox: {},
  listbox: {},
}

export function useCombobox (options: UseComboboxOptions = {}): Combobox {
  // OPTIONS
  const {
    textbox: textboxOptions,
    listbox: listboxOptions,
  } = { ...defaultOptions, ...options }


  // LISTBOX OPTION ABILITY
  const ability = ref([])

  onMounted(() => {
    // Search process keeps ability udpated with changes in option length or order
    ability.value = new Array(listbox.options.elements.value.length).map(() => 'enabled')
  })


  // INTERFACES
  const queryBasedAbilityOption: UseComboboxOptions['listbox']['ability'] = {
          get: index => ability.value[index],
          watchSource: [ability],
        },
        ensuredUserAbilityOption = (() => {
          if (!listboxOptions.ability) {
            return {
              get: () => 'enabled' as const,
              watchSource: [],
            }
          }

          if (typeof listboxOptions.ability === 'function') {
            return {
              get: listboxOptions.ability,
              watchSource: [],
            }
          }

          return {
            get: listboxOptions.ability.get,
            watchSource: Array.isArray(listboxOptions.ability.watchSource) ? listboxOptions.ability.watchSource : [],
          }
        })(),
        composedAbilityOption: UseComboboxOptions['listbox']['ability'] = {
          get: index => {
            return queryBasedAbilityOption.get(index) === 'enabled'
              ? ensuredUserAbilityOption.get(index)
              : 'disabled'
          },
          watchSource: [
            ...(queryBasedAbilityOption.watchSource as WatchSource[]),
            ...ensuredUserAbilityOption.watchSource,
          ],
        }

  const textbox = useTextbox(textboxOptions)
  const listbox = useListbox({
    ...(listboxOptions as UseListboxOptions<false, true>),
    popup: true,
    initialSelected: 'none',
    transfersFocus: false,
    ability: composedAbilityOption,
    disabledOptionsReceiveFocus: false,
  })


  // SEARCH
  const queryMatchThreshold = listboxOptions?.queryMatchThreshold ?? 1

  watch(
    () => textbox.text.value.string,
    () => {
      listbox.paste(textbox.text.value.string)
      listbox.search()
    }
  )

  watch(
    () => listbox.searchable.value.results,
    () => {
      if (listbox.searchable.value.results.length === 0) {
        ability.value = new Array(listbox.options.elements.value.length).map(() => 'disabled')
        return
      }

      ability.value = (listbox.searchable.value.results as MatchData<string>[]).map( 
        ({ score }) => score >= queryMatchThreshold ? 'enabled' : 'disabled'
      )
    }
  )

  
  // FOCUSED AND SELECTED
  focusedAndSelectedOn({
    keyboardElement: textbox.root.element,
    pointerElement: listbox.options.elements,
    getKeyboardIndex: () => listbox.focused.value.location,
    focus: listbox.focus,
    focused: listbox.focused,
    select: listbox.select,
    selected: listbox.selected,
    deselect: listbox.deselect,
    isSelected: listbox.is.selected,
    query: computed(() => textbox.text.value.string + ' '), // Force disable spacebar handling
    orientation: 'vertical',
    multiselectable: false,
    selectsOnFocus: false,
    clearable: false,
    popup: true,
    getAbility: ensureGetStatus({
      element: listbox.options.elements,
      status: composedAbilityOption,
    }),
  })

  
  // STATUS
  watch(
    () => listbox.searchable.value.results,
    () => {
      if (some(({ score }) => score >= queryMatchThreshold)(listbox.searchable.value.results)) {
        if (listbox.is.closed()) {
          listbox.open()
        }

        // Listbox is already open
        return
      }

      if (listbox.is.opened()) {
        listbox.close()
      }
    }
  )

  on<'focus'>({
    element: textbox.root.element,
    effects: defineEffect => [
      defineEffect(
        'focus',
        () => {
          listbox.open()
        }
      ),
    ]
  })


  // BASIC BINDINGS
  bind({
    element: textbox.root.element,
    values: {
      role: 'combobox',
      ariaAutocomplete: 'list',
      ariaHaspopup: 'listbox',
      ariaExpanded: computed(() => `${listbox.is.opened()}`),
      ariaControls: computed(() =>
        listbox.is.opened() && textbox.text.value.string.length > 0
          ? listbox.root.id.value
          : undefined
      ),
      ariaActivedescendant: computed(() =>
        listbox.is.opened() && textbox.text.value.string.length > 0
          ? listbox.options.ids.value[listbox.focused.value.location]
          : undefined
      )
    }
  })


  // MULTIPLE CONCERNS
  const complete: Combobox['complete'] = (...params) => {
    textbox.text.value.complete(...params)
    nextTick(() => listbox.close())
  }

  
  // API
  return {
    textbox,
    listbox,
    complete,
  }
}
