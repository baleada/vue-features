import { ref, watchEffect, onMounted } from 'vue'
import useBindings from './useBindings'

export default function useConditionalDisplay ({ target, condition }) {
  // Cache original display
  let originalDisplay
  onMounted(() => (originalDisplay = window.getComputedStyle(target.value).display))

  // Set up reactive reference for the value of display
  const display = ref(originalDisplay) // defaults to undefined
  
  // Watch condition (computed as true or false), and update display's value (not the actual DOM target) accordingly
  onMounted(() => {
    watchEffect(() => {
      console.log(condition.value)
      display.value = condition.value ? originalDisplay : 'none'
    })
  })

  useBindings({
    target,
    bindings: { 'style.display': display }
  })
}
