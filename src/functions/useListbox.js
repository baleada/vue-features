// Designed to the specifications listed here: https://www.w3.org/TR/wai-aria-practices-1.1/#tabpanel
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useConditionalDisplay, useListenables, useBindings } from '../affordances'
import { useId, useTarget, toEachable } from '../util'
import { useNavigateable } from '@baleada/vue-composition'

const defaultOptions = {
  initialSelected: 0,
}

export default function useListbox (
  { totalOptions, selection, orientation },
  options = {}
) {
  // Process arguments
  const eachable = toEachable(totalOptions),
        {
          initialSelected,
          transition,
        } = { ...defaultOptions, ...options }

  // Set up core state

  const listbox = {
    root,
    options,

  }
}
