import { ref, watch, computed, nextTick, onMounted } from 'vue'
import type { Ref } from 'vue'
import { findIndex, some } from 'lazy-collections'
import type { MatchData } from 'fast-fuzzy'
import { Completeable, createFilter, createMap } from '@baleada/logic'
import { useTextbox, useListbox } from '../interfaces'
import type { Textbox, UseTextboxOptions, Listbox, UseListboxOptions } from "../interfaces"
import { useConditionalRendering } from '../extensions'
import type { ConditionalRendering } from '../extensions'
import { bind, on } from  '../affordances'
import type { TransitionOption } from  '../affordances'
import { ensureTransitionOption, listOn } from '../extracted'

export type Combobox = {
  textbox: Textbox,
  listbox: Listbox<false, true> & { rendering: ConditionalRendering },
  complete: (...params: Parameters<Completeable['complete']>) => void,
}

export type UseComboboxOptions = {
  textbox?: Omit<UseTextboxOptions, 'stopsPropagation'>,
  listbox?: Omit<UseListboxOptions<false, true>, 'stopsPropagation'>,
  stopsPropagation?: boolean,
  transition?: {
    listbox?: TransitionOption<Ref<HTMLElement>>,
  }
}

const defaultOptions: UseComboboxOptions = {
  textbox: {},
  listbox: {},
  stopsPropagation: false,
}

export function useCombobox (options: UseComboboxOptions = {}): Combobox {
  // OPTIONS
  const {
    textbox: textboxOptions,
    listbox: listboxOptions,
    stopsPropagation,
    transition,
  } = { ...defaultOptions, ...options }


  // INTERFACES
  const textbox = useTextbox({ stopsPropagation, ...textboxOptions }),
        listbox = useListbox({
          stopsPropagation,
          ...(listboxOptions as UseListboxOptions<false, true>),
          popup: true,
          initialSelected: 'none',
          transfersFocus: false,
          disabledOptionsReceiveFocus: false,
        })

  
  // LISTBOX OPTION ABILITY
  const ability = ref<typeof listbox['options']['meta']['value'][0]['ability'][]>([])

  watch(
    () => textbox.text.value.string,
    () => {
      if (!textbox.text.value.string) {
        if (listbox.is.opened()) {
          ability.value = toEnableds(listbox.options.elements.value)
          return
        }

        const stop = watch(
          () => listbox.is.opened(),
          is => {
            if (is) {
              ability.value = toEnableds(listbox.options.elements.value)
              stop()
            }
          },
          { flush: 'post' }
        )
      }
    }
  )

  watch(
    () => listbox.searchable.value.results,
    () => {
      if (listbox.searchable.value.results.length === 0) {
        ability.value = toDisableds(listbox.options.elements.value)
        return
      }

      ability.value = createMap<MatchData<string>, typeof ability['value'][0]>(
        ({ score }) => score >= queryMatchThreshold ? 'enabled' : 'disabled'
      )(listbox.searchable.value.results as MatchData<string>[])
    }
  )


  // SEARCH
  const queryMatchThreshold = listboxOptions?.queryMatchThreshold ?? 1

  
  // FOCUSED AND SELECTED
  listOn({
    keyboardElement: textbox.root.element,
    pointerElement: listbox.root.element,
    getIndex: () => listbox.focused.value.location,
    focus: listbox.focus,
    focused: listbox.focused,
    select: listbox.select,
    selected: listbox.selected,
    deselect: listbox.deselect,
    isSelected: listbox.is.selected,
    query: computed(() => textbox.text.value.string + ' '), // Force disable spacebar handling
    orientation: 'vertical',
    multiselectable: false,
    preventSelectOnFocus: () => {},
    allowSelectOnFocus: () => {},
    selectsOnFocus: false,
    stopsPropagation,
    clears: false,
    popup: true,
    getAbility: index => ability.value[index],
  })

  
  // STATUS
  watch(
    () => listbox.searchable.value.results,
    () => {
      if (
        some<MatchData<string>>(
          ({ score }) => score >= queryMatchThreshold
        )(listbox.searchable.value.results as MatchData<string>[])
      ) {
        // Listbox is already open
        return
      }

      if (listbox.is.opened()) listbox.close()
    }
  )


  // BASIC BINDINGS
  bind(
    textbox.root.element,
    {
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
  )

  bind(
    listbox.root.element,
    {
      id: listbox.root.id,
    }
  )


  // RENDERING
  const ensuredTransition = ensureTransitionOption(listbox.root.element, transition?.listbox || {}),
        rendering = useConditionalRendering(listbox.root.element, {
          initialRenders: listboxOptions.initialPopupTracking === 'opened',
          show: { transition: ensuredTransition }
        })

  watch(
    listbox.status,
    () => {
      switch (listbox.status.value) {
        case 'opened':
          rendering.render()
          break
        case 'closed':
          rendering.remove()
          break
      }
    }
  )


  // MULTIPLE CONCERNS
  const complete: Combobox['complete'] = (...params) => {
          textbox.text.value.complete(...params)
          nextTick(() => requestAnimationFrame(() => {
            listbox.close()
          }))
        }

  watch(
    () => textbox.text.value.string,
    () => {
      if (!textbox.text.value.string) return
      
      // Weird timing waiting for validity to update
      nextTick(() => {
        if (textbox.is.valid()) {
          listbox.close()
          return
        }
  
        listbox.open()
        nextTick(() => {
          listbox.paste(textbox.text.value.string)
          listbox.search()
        })
      })
    },
  )

  on(
    textbox.root.element,
    {
      focusout: () => {
        if (!textbox.is.valid()) {
          complete('')
        }
      },
      keydown: (event, { matches }) => {
        if (listbox.is.closed() && matches('down')) {
          if (stopsPropagation) event.stopPropagation()
          listbox.open()
          return
        }

        if (listbox.is.opened() && matches('esc')) {
          if (stopsPropagation) event.stopPropagation()
          listbox.close()
          return
        }

        if (
          listbox.is.opened()
          && matches('enter')
          && toIsEnabled(ability.value).length === 1
          && (findIndex<typeof ability['value'][0]>(a => a === 'enabled')(ability.value) as number) === listbox.selected.value.newest
        ) {
          if (stopsPropagation) event.stopPropagation()
          
          // Force reselect
          const selected = listbox.selected.value.newest
          listbox.deselect()
          nextTick(() => listbox.select.exact(selected))
          return
        }

        if (
          textbox.text.value.string.length
          && textbox.text.value.selection.end - textbox.text.value.selection.start === textbox.text.value.string.length
          && matches('backspace')
        ) {
          if (stopsPropagation) event.stopPropagation()
          listbox.open()
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
        getRef: (index, meta) => listbox.options.getRef(index, {
          ...(meta || {}),
          ability: (ability.value[index] === 'disabled' || meta?.ability === 'disabled')
            ? 'disabled'
            : 'enabled'
        }),
      },
      rendering,
    },
    complete,
  }
}

const toDisableds = createMap<HTMLElement, 'disabled'>(() => 'disabled'),
      toEnableds = createMap<HTMLElement, 'enabled'>(() => 'enabled'),
      toIsEnabled = createFilter<'enabled' | 'disabled'>(a => a === 'enabled')
