import { at, findIndex, pipe as link, some } from 'lazy-collections'
import { createFocusable } from '@baleada/logic'
import { on } from '../affordances'
import type { ListFeatures } from './useListFeatures'
import type { ElementApi } from './useElementApi'
import type { ListApi } from './useListApi'

/**
 * The browser natively allows focus to move into elements that have aria-hidden="true".
 * This means that if an unselected item in a single-select list, where any given list item
 * can contain focusable content (e.g. a tablist or carousel), a user could tab into them,
 * even though they should be hidden from assistive tech.
 *
 * `ariaHiddenFocusableOn` adds event handlers that detect when focus is moving
 * somewhere it shouldn't go, and focus the appropriate element.
 */
export function ariaHiddenFocusableOn ({
  rootApi: { element: root },
  listApi: { list },
  selected,
}: {
  rootApi: ElementApi<HTMLElement, true>,
  listApi: ListApi<HTMLElement, true>,
  selected: ListFeatures<false>['selected'],
}) {
  on(
    root,
    {
      // When focus leaves the selected item, make sure it can't move into an unselected item.
      focusout: event => {
        if (
          list.value[selected.newest].contains(event.relatedTarget as Node)
          || !some<HTMLElement>(item => item.contains(event.target as HTMLElement))(list.value)
        ) return

        // Focus is moving out of the selected item. If it's moving into an unselected item,
        // move focus before or after the root as needed.

        const relatedTargetIndex = findIndex<HTMLElement>(
          item => item.contains(event.relatedTarget as HTMLElement),
        )(list.value) as number

        if (relatedTargetIndex === -1) return

        const relativeIndex = relatedTargetIndex - selected.newest

        if (relativeIndex <= 0) {
          createFocusable('previous')(list.value[0])?.focus()
          return
        }

        link(
          at(-1),
          item => createFocusable('last')(item) || item,
          createFocusable('next'),
          el => el?.focus()
        )(list.value)
      },
      /**
       * When focus moves into an unselected item, move it to the selected item.
       *
       * WARNING: This function will not work if unselected items _do_ contain focusable
       * elements but the selected item does _not_ contain focusable elements. We don't
       * currently have this use case, but if we ever do, we can adjust this function.
       */
      focusin: event => {
        if (
          list.value[selected.newest].contains(event.target as HTMLElement)
          || !some<HTMLElement>(item => item.contains(event.target as HTMLElement))(list.value)
        ) return

        // Focus is moving into an unselected item.
        // Move focus into the selected item.

        link(
          at(selected.newest),
          createFocusable('first', { predicatesElement: true }),
          el => el?.focus()
        )(list.value)
      },
    }
  )
}
