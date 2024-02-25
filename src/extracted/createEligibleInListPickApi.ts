import { watch } from 'vue'
import type { ShallowReactive } from 'vue'
import { findIndex, find } from 'lazy-collections'
import { createFilter, createReduce, Pickable } from '@baleada/logic'
import type { PickOptions } from '@baleada/logic'
import type { ListApi } from './useListApi'
import type { ToEligible, ToListEligibility } from './createToEligibleInList'
import type { Ability } from './ability'

export type EligibleInListPickApi = {
  exact: (indexOrIndices: number | number[], options?: BaseEligiblePickApiOptions & PickOptions) => 'enabled' | 'none',
  next: (index: number, options?: BaseEligiblePickApiOptions & PickOptions) => 'enabled' | 'none',
  previous: (index: number, options?: BaseEligiblePickApiOptions & PickOptions) => 'enabled' | 'none',
  all: (options?: BaseEligiblePickApiOptions) => 'enabled' | 'none',
}

type BaseEligiblePickApiOptions = { toEligibility?: ToListEligibility }

const defaultEligiblePickApiOptions: BaseEligiblePickApiOptions = {
  toEligibility: () => 'eligible',
}

/**
 * Creates methods for picking only the elements in a list that are considered eligible,
 * e.g. the enabled elements.
 * 
 * Methods return the ability of the element(s), if any, that they were able to pick.
 */
export function createEligibleInListPickApi<
  Meta extends {
    ability?: Ability,
    kind?: 'item' | 'checkbox' | 'radio',
    groupName?: string,
  }
> (
  {
    pickable,
    api,
    toNextEligible,
    toPreviousEligible,
  }: {
    pickable: ShallowReactive<Pickable<HTMLElement>>,
    api: ListApi<HTMLElement, true, Meta>,
    toNextEligible: ToEligible,
    toPreviousEligible: ToEligible,
  }
): EligibleInListPickApi {
  const exact: EligibleInListPickApi['exact'] = (indexOrIndices, options = {}) => {
          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickApiOptions, ...options },
                eligible = createFilter<number>(index =>
                  getEligibility(index) === 'eligibile'
                  && toEligibility(index) === 'eligible'
                )(
                  new Pickable(pickable.array)
                    .pick(indexOrIndices)
                    .picks
                )

          if (eligible.length > 0) {
            const p = new Pickable(pickable.array)
                    .pick(pickable.picks)
                    .pick(eligible, pickOptions),
                  picksByGroupName: Record<string, number> = {},
                  omits: number[] = []

            for (let i = p.picks.length - 1; i >= 0; i--) {
              const pick = p.picks[i],
                    groupName = toGroupName(p.picks[i])

              if (!groupName) continue

              if (typeof picksByGroupName[groupName] !== 'number') {
                picksByGroupName[groupName] = pick
                continue
              }

              omits.push(pick)
            }

            p.omit(omits)
            pickable.pick(p.picks, { replace: 'all' })
            return 'enabled'
          }

          return 'none'
        },
        next: EligibleInListPickApi['next'] = (index, options = {}) => {
          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickApiOptions, ...options },
                nextEligible = toNextEligible({
                  index,
                  toEligibility: index => getEligibility(index) === 'eligibile'
                    ? toEligibility(index)
                    : 'ineligible',
                  loops: false,
                })
            
          if (typeof nextEligible === 'number') {
            const nextEligibleGroupName = toGroupName(nextEligible),
                  existingPickInGroup = nextEligibleGroupName
                    ? find<number>(pick => toGroupName(pick) === nextEligibleGroupName)(pickable.picks) as number
                    : -1

            if (typeof existingPickInGroup === 'number') pickable.omit(existingPickInGroup)

            pickable.pick(nextEligible, pickOptions)
            return 'enabled'
          }

          return 'none'
        },
        previous: EligibleInListPickApi['next'] = (index, options = {}) => {          
          const { toEligibility, ...pickOptions } = { ...defaultEligiblePickApiOptions, ...options },
                previousEligible = toPreviousEligible({
                  index,
                  toEligibility: index => getEligibility(index) === 'eligibile'
                    ? toEligibility(index)
                    : 'ineligible',
                  loops: false,
                })
        
          if (typeof previousEligible === 'number') {
            const previousEligibleGroupName = toGroupName(previousEligible),
                  existingPickInGroup = previousEligibleGroupName
                    ? find<number>(pick => toGroupName(pick) === previousEligibleGroupName)(pickable.picks) as number
                    : -1

            if (typeof existingPickInGroup === 'number') pickable.omit(existingPickInGroup)

            pickable.pick(previousEligible, pickOptions)
            return 'enabled'
          }

          return 'none'
        },
        all: EligibleInListPickApi['all'] = (options = {}) => {
          const { toEligibility } = { ...defaultEligiblePickApiOptions, ...options },
                newIndices: number[] = []
          
          for (let i = 0; i < pickable.array.length; i++) {
            if (toAbility(i) === 'enabled' && toEligibility(i) === 'eligible') {
              newIndices.push(i)
            }
          }

          if (newIndices.length > 0) {
            pickable.pick(newIndices)
            return 'enabled'
          }

          return 'none'
        },
        getEligibility = (index: number) => (
          (
            toAbility(index) === 'enabled'
            && toKind(index) !== 'item'
          ) ? 'eligibile' : 'ineligible'
        ),
        toAbility = (index: number) => api.meta.value[index].ability || 'enabled',
        toKind = (index: number) => api.meta.value[index].kind,
        toGroupName = (index: number) => api.meta.value[index].groupName

  watch(
    [api.status, api.list, api.meta],
    (currentSources, previousSources) => {
      const { 0: status, 1: currentElements, 2: currentMeta } = currentSources,
            { 1: previousElements } = previousSources
      
      if (!currentElements.length) return // Conditionally removed

      if (status.order === 'changed') {
        const newPicks: number[] = []
        for (const pick of pickable.picks) {
          const newIndex = findIndex<HTMLElement>(
            element => element === previousElements[pick]
          )(currentElements) as number
          
          if (typeof newIndex === 'number') newPicks.push(newIndex)
        }

        exact(newPicks, { replace: 'all' })

        return
      }

      if (status.length === 'shortened') {
        // Conditional rendering empties array
        if (currentElements.length === 0) return

        const newPicks: number[] = []
        for (const pick of pickable.picks) {
          if (pick <= currentElements.length - 1) newPicks.push(pick)
        }

        if (newPicks.length === 0) {
          pickable.omit()
          return
        }

        exact(newPicks, { replace: 'all' })

        return
      }

      const indices = createReduce<number, number[]>((indices, pick) => {
        if (!currentMeta.length || currentMeta[pick].ability === 'enabled') indices.push(pick)
        return indices
      }, [])(pickable.picks)
      
      const abilityStatus = indices.length === pickable.picks.length
        ? 'none'
        : 'changed'

      if (abilityStatus === 'changed') {
        if (indices.length === 0) {
          pickable.omit()
          return
        }

        exact(indices, { replace: 'all' })
      }
    },
    { flush: 'post' }
  )

  return {
    exact,
    next,
    previous,
    all,
  }
}
