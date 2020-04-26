import { ref, computed, watch, onMounted } from '@vue/composition-api'
import { useCompleteable, useListenable } from '@baleada/vue-composition'

export default function useAutocomplete () {

  return ref({
    
  })
}

function nextTick (callback) {
  setTimeout(callback, 0)
}