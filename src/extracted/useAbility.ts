import { shallowRef, type WatchSource } from 'vue'
import { bind } from '../affordances'
import { onRendered } from './onRendered'
import { toAbilityBindValues } from './toAbilityBindValues'
import type { AbilityMeta } from './toAbilityBindValues'
import type { ElementApi } from './useElementApi'

export type UsedAbility = {
  is: {
    enabled: () => boolean,
    disabled: () => boolean,
  }
}

export function useAbility (
  api: ElementApi<HTMLElement, true, AbilityMeta>,
  options: {
    tabindex?: {
      get?: () => number,
      watchSource?: WatchSource | WatchSource[],
    }
  } = {}
): UsedAbility {
  const { tabindex } = options,
        isEnabled = shallowRef(false),
        isDisabled = shallowRef(false),
        abilityBindValues = toAbilityBindValues(api)

  bind(
    api.element,
    {
      ...abilityBindValues,
      tabindex: {
        get: () => tabindex?.get() ?? abilityBindValues.tabindex.get(),
        watchSource: [
          ...(
            Array.isArray(abilityBindValues.tabindex.watchSource)
              ? abilityBindValues.tabindex.watchSource
              : [abilityBindValues.tabindex.watchSource]
          ),
          ...(
            tabindex
              ? (
                Array.isArray(tabindex.watchSource)
                  ? tabindex.watchSource
                  : [tabindex.watchSource]
              )
            : []
          ),
        ],
      },
    }
  )

  onRendered(
    api.meta,
    {
      predicateRenderedWatchSourcesChanged: ([currentMeta], [previousMeta]) => (
        currentMeta.ability !== previousMeta?.ability
      ),
      effect: () => {
        isEnabled.value = !api.meta.value.ability || api.meta.value.ability === 'enabled'
        isDisabled.value = api.meta.value.ability === 'disabled'
      },
    }
  )

  return {
    is: {
      enabled: () => isEnabled.value,
      disabled: () => isDisabled.value,
    },
  }
}
