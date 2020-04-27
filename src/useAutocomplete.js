import { isRef, computed, watch } from '@vue/composition-api'
import { useCompleteable, useSearchable, useNavigateable } from '@baleada/vue-composition'
import { useNavigateable } from '../../vue-composition/lib'

export default function useAutocomplete ({ completeable: completeableRefOrConstructorArgs, searchable: searchableRefOrConstructorArgs, navigateable: navigateableRefOrConstructorArgs, toQuery = segment => segment }) {
  const completeable = isRef(completeableRefOrConstructorArgs) ? completeableRefOrConstructorArgs : useCompleteable(...completeableRefOrConstructorArgs),
        searchable = isRef(searchableRefOrConstructorArgs) ? searchableRefOrConstructorArgs : useSearchable(...searchableRefOrConstructorArgs),
        navigateable = isRef(navigateableRefOrConstructorArgs) ? navigateableRefOrConstructorArgs : useSearchable(...navigateableRefOrConstructorArgs)

  watch(
    () => completeable.value.segment,
    () => {
      const rawQuery = toQuery(completeable.value.segment),
            query = Array.isArray(rawQuery) ? rawQuery : [rawQuery]
      searchable.value.search(...query)
      navigateable.value.setArray(searchable.value.results)
    }
  )

  return {
    completeable: computed(() => completeable.value),
    searchable: computed(() => searchable.value),
    navigateable: computed(() => navigateable.value)
  }
}