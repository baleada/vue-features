import { ref, onMounted } from 'vue'
import { nanoid as getNanoid } from 'nanoid'
import catchWithNextTick from './catchWithNextTick.js'

export default function useId (target) {
  const id = ref(''),
        nanoid = getNanoid()
  
  onMounted(() => {
    catchWithNextTick(() => id.value = target.value?.id || nanoid)
  })

  return id
}
