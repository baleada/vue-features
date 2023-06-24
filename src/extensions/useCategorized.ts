import { computed, unref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { createKeys } from '@baleada/logic'

type Categorized<Value extends any> = {
  state: ComputedRef<Value>
}

type UseCategorizedConfig<Value extends any, Categories extends any[]> = {
  default: Value | Ref<Value>,
  byCategory: Partial<Record<Categories[number], Value>> | Ref<Partial<Record<Categories[number], Value>>>,
  category: Ref<Categories[number]>,
}

type UseCategorizedOptions<Categories extends any[]> = {
  priority?: Categories[number][],
}

export function useCategorized<Value extends any, Categories extends any[]> (
  config: UseCategorizedConfig<Value, Categories>,
  options: UseCategorizedOptions<Categories>,
): Categorized<Value> {
  const { default: defaultValue, byCategory, category } = config,
        { priority = createKeys()(byCategory) } = options,
        state = computed(() => {
          for (const c of priority) {
            if (c === category.value) return unref(byCategory)[c]
          }

          return unref(defaultValue)
        })

  return { state }
}
