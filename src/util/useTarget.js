import { ref, onBeforeUpdate, onMounted, onUpdated } from 'vue'

export function useTarget (type, options = {}) {
  const { effect } = options

  switch (type) {
    case 'single': {
      const target = ref(null),
            handle = t => (target.value = t),
            api = {
              ref: handle,
              el: target,
            }

      return { target, handle, api }
    }
    case 'multiple': {
      const targets = ref([]),
            handle = index => target => {
              if (target) targets.value[index] = target
            },
            api = {
              getRef: handle,
              els: targets
            }

      onBeforeUpdate(() => (targets.value = []))
      
      onMounted(() => effect?.())
      onUpdated(() => effect?.())

      return { targets, handle, api }
    }
  } 
}
