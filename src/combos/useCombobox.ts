import { ref, watch, computed, nextTick } from 'vue'
import type { Ref } from 'vue'
import { findIndex, some } from 'lazy-collections'
import type { MatchData } from 'fast-fuzzy'
import type { Completeable } from '@baleada/logic'
import { createFilter, createMap, createKeycomboMatch } from '@baleada/logic'
import { useTextbox, useListbox } from '../interfaces'
import type { Textbox, UseTextboxOptions, Listbox, UseListboxOptions } from '../interfaces'
import { useWithRender } from '../extensions'
import type { WithRender } from '../extensions'
import { bind, on } from  '../affordances'
import type { TransitionOption } from  '../affordances'
import { narrowTransitionOption, listOn } from '../extracted'

export type Combobox = {
  textbox: Textbox,
  listbox: Listbox<false, true>
    & {
      is: Listbox<false, true>['is'] & WithRender['is'],
      renderStatus: WithRender['status']
    },
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
          popsUp: true,
          initialSelected: 'none',
          transfersFocus: false,
          disabledOptionsReceiveFocus: false,
        })

  
  // LISTBOX OPTION ABILITY
  const ability = ref<typeof listbox['options']['meta']['value'][0]['ability'][]>([])

  watch(
    () => textbox.text.string,
    () => {
      if (!textbox.text.string) {
        if (listbox.is.opened()) {
          ability.value = toAllEnabled(listbox.options.list.value)
          return
        }

        const stop = watch(
          () => listbox.is.opened(),
          is => {
            if (is) {
              ability.value = toAllEnabled(listbox.options.list.value)
              stop()
            }
          },
          { flush: 'post' }
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

  
  // FOCUSED AND SELECTED
  listOn({
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
    stopsPropagation,
    clears: false,
    popsUp: true,
    getAbility: index => ability.value[index],
  })

  
  // STATUS
  watch(
    () => listbox.results.value,
    () => {
      if (
        some<MatchData<string>>(
          ({ score }) => score >= queryMatchThreshold
        )(listbox.results.value as MatchData<string>[])
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
        listbox.is.opened() && textbox.text.string.length > 0
          ? listbox.root.id.value
          : undefined
      ),
      ariaActivedescendant: computed(() =>
        listbox.is.opened() && textbox.text.string.length > 0
          ? listbox.options.ids.value[listbox.focused.location]
          : undefined
      ),
    }
  )


  // RENDERING
  const narrowedTransition = narrowTransitionOption(listbox.root.element, transition?.listbox || {}),
        withRender = useWithRender(listbox.root.element, {
          initialRenders: listboxOptions.initialPopupStatus === 'opened',
          show: { transition: narrowedTransition },
        })

  watch(
    listbox.status,
    () => {
      switch (listbox.status.value) {
        case 'opened':
          withRender.render()
          break
        case 'closed':
          withRender.remove()
          break
      }
    }
  )


  // MULTIPLE CONCERNS
  const complete: Combobox['complete'] = (...params) => {
          textbox.text.complete(...params)
          nextTick(() => requestAnimationFrame(() => {
            listbox.close()
          }))
        }

  watch(
    () => textbox.text.string,
    () => {
      if (!textbox.text.string) return
      
      // Weird timing waiting for validity to update
      nextTick(() => {
        if (textbox.is.valid()) {
          listbox.close()
          return
        }
  
        listbox.open()
        nextTick(() => {
          listbox.paste(textbox.text.string)
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
      keydown: event => {
        if (listbox.is.closed() && createKeycomboMatch('down')(event)) {
          if (stopsPropagation) event.stopPropagation()
          listbox.open()
          return
        }

        if (listbox.is.opened() && createKeycomboMatch('esc')(event)) {
          if (stopsPropagation) event.stopPropagation()
          listbox.close()
          return
        }

        if (
          listbox.is.opened()
          && createKeycomboMatch('enter')(event)
          && toEnabled(ability.value).length === 1
          && (findIndex<typeof ability['value'][0]>(a => a === 'enabled')(ability.value) as number) === listbox.selected.newest
        ) {
          if (stopsPropagation) event.stopPropagation()
          
          // Force reselect
          const selected = listbox.selected.newest
          listbox.deselect()
          nextTick(() => listbox.select.exact(selected))
          return
        }

        if (
          textbox.text.string.length
          && textbox.text.selection.end - textbox.text.selection.start === textbox.text.string.length
          && createKeycomboMatch('backspace')(event)
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
        ref: (index, meta) => listbox.options.ref(index, {
          ...meta,
          ability: (ability.value[index] === 'disabled' || meta?.ability === 'disabled')
            ? 'disabled'
            : 'enabled',
        }),
      },
      is: {
        ...listbox.is,
        ...withRender.is,
      },
      renderStatus: withRender.status,
    },
    complete,
  }
}

const toAllDisabled = createMap<HTMLElement, 'disabled'>(() => 'disabled'),
      toAllEnabled = createMap<HTMLElement, 'enabled'>(() => 'enabled'),
      toEnabled = createFilter<'enabled' | 'disabled'>(a => a === 'enabled')
