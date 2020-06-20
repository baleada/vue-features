import { isRef, computed, watch } from '@vue/composition-api'
import { useSearchable, useNavigateable, useListenable } from '@baleada/vue-composition'

export default function useAutocomplete ({ completeable: completeableRefOrConstructorArgs, searchable: searchableRefOrConstructorArgs, navigateable: navigateableRefOrConstructorArgs, toQuery = segment => segment, options }) {
  const { completeable } = useCompleteableInput({ completeable: completeableRefOrConstructorArgs, input }),
        searchable = isRef(searchableRefOrConstructorArgs) ? searchableRefOrConstructorArgs : useSearchable(...searchableRefOrConstructorArgs),
        navigateable = isRef(navigateableRefOrConstructorArgs) ? navigateableRefOrConstructorArgs : useNavigateable(...navigateableRefOrConstructorArgs)

  /* Textbox */
  const down = useListenable('down'),
        downHandle = evt => {
          if (statuses.value.includes('open')) {
            if (completesOnBlur) {
              // Moves focus to the first suggestion.
            } else {
              // Moves focus to the second suggestion
            }
          } else {
            // opens the listbox and moves focus to first suggestion.
          }
        }

  const up = useListenable('up'),
        upHandle = evt => {
          if (statuses.value.includes('open')) {
            // moves focus to the previous suggestion.
          } else {
            // opens the listbox and moves focus to the last suggestion.
          }
        }

  // Enter 	

  //    If first value is not automatically selected: Does nothing.
  //    Else: Sets the textbox value to the content of the selected option. Closes the listbox.

  // Escape 	

  //    Clears the textbox
  //    If the listbox is displayed, closes it.

  // Standard single line text editing keys 	

  //    Keys used for cursor movement and text manipulation, such as Delete and Shift + Right Arrow.
  //    An HTML input with type="text" is used for the textbox so the browser will provide platform-specific editing keys.

  

  /* Listbox */
  // Enter 	
  
  //    Sets the textbox value to the content of the focused option in the listbox.
  //    Closes the listbox.
  //    Sets focus on the textbox.
  
  // Escape 	
  
  //    Closes the listbox.
  //    Sets focus on the textbox.
  //    Clears the textbox.
  
  // Down Arrow 	
  
  //    Moves focus to the next option.
  //    If focus is on the last option, moves focus to the first option.
  //    Note: This wrapping behavior is useful when Home and End move the editing cursor as described below.
  
  // Up Arrow 	
  
  //    Moves focus to the previous option.
  //    If focus is on the first option, moves focus to the last option.
  //    Note: This wrapping behavior is useful when Home and End move the editing cursor as described below.
  
  // Right Arrow 	
  
  //    Moves focus to the textbox and moves the editing cursor one character to the right.
  //    Left Arrow 	Moves focus to the textbox and moves the editing cursor one character to the left.
  //    Home 	Moves focus to the textbox and places the editing cursor at the beginning of the field.
  //    End 	Moves focus to the textbox and places the editing cursor at the end of the field.

  // Printable Characters 	
  
  //    Moves focus to the textbox.
  //    Types the character in the textbox.

            
  watch(
    () => completeable.value.segment,
    () => {
      const rawQuery = toQuery(completeable.value.segment),
            query = Array.isArray(rawQuery) ? rawQuery : [rawQuery]
      searchable.value.search(...query)
      navigateable.value.setArray(searchable.value.results)
    }
  )

  // Listen for arrow down on input when t

  return {
    completeable: computed(() => completeable.value),
    searchable: computed(() => searchable.value),
    navigateable: computed(() => navigateable.value)
  }
}