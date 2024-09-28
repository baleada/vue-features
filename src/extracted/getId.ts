import { useId, type ComponentInternalInstance } from 'vue'

export function getId(instance?: ComponentInternalInstance) {
  return instance
    // @ts-expect-error
    ? (instance.appContext.config.idPrefix || 'v') + '-' + instance.ids[0] + instance.ids[1]++
    : useId()
}
