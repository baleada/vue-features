import { computed, isRef, onMounted, watch, nextTick } from 'vue'
import { catchWithNextTick } from '../util'

export default function useAttributeBinding ({ target: rawTarget, attribute: rawAttribute, value: rawValue }, options) {
  const target = ensureTarget(rawTarget),
        attribute = ensureAttribute(rawAttribute)
  
  if (isRef(rawValue)) {
    const effect = () => catchWithNextTick(() => target.value.forEach(el => el.setAttribute(attribute, rawValue.value)), options)

    nextTick(() => effect())
    onMounted(() => 
      watch(
        [() => target.value, () => rawValue.value],
        () => effect(),
        { flush: 'post' }
      )
    )
  } else {
    const value = typeof rawValue === 'function'
            ? rawValue
            : () => rawValue,
          effect = () => catchWithNextTick(() => target.value.forEach((el, index) => el.setAttribute(attribute, value(el, index))), options)

    nextTick(() => effect())
    onMounted(() => 
      watch(
        () => target.value,
        () => effect(),
        { flush: 'post' }        
      )
    )
  } 
}

function ensureTarget (rawTarget) {
  return isRef(rawTarget)
    ? Array.isArray(rawTarget.value)
      ? rawTarget
      : computed(() => [rawTarget.value])
    : Array.isArray(rawTarget)
      ? computed(() => rawTarget)
      : computed(() => [rawTarget])
}

function ensureAttribute (rawAttribute) {
  switch (rawAttribute) {
    case 'for':
      return 'htmlFor'
    default:
      return /^aria[A-Z]/.test(rawAttribute)
        ? `aria-${rawAttribute.slice('aria'.length).toLowerCase()}`
        : rawAttribute
  }
}

