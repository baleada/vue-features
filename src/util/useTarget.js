import { ref, onBeforeUpdate } from 'vue'

export default function useTarget (type) {
  switch (type) {
    case 'single': {
      const target = ref(null),
            handle = () => t => (target.value = t)

      return { target, handle }
    }
    case 'multiple': {
      const targets = ref([]),
            handle = index => target => {
              if (target) targets.value[index] = target
            }

      onBeforeUpdate(() => (targets.value = []))

      return { targets, handle }
    }
  } 
}
