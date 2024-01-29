import type { FunctionalComponent } from 'vue'
import { createList } from '@baleada/logic'
// Import path for testing only! In prod, this would import
// from the upcoming release of `@baleada/vue-features`
import type { Menu } from '../../../../../../src/combos/useMenu'

export const SystemMenu: FunctionalComponent<{
  menu: Menu,
  options: string[],
}> = ({ menu, options }) => {
  menu.bar.beforeUpdate()

  return (
    <>
      <button ref={menu.button.root.ref()}>Open menu</button>
      {!menu.bar.is.removed() && (
        <div
          ref={menu.bar.root.ref()}
          class="flex flex-col max-w-md"
        >
          {options.map((option, index) => (
            <div
              key={option}
              ref={menu.bar.items.ref(index, { kind: index > 2 ? 'checkbox' : 'item' })}
              class={createList()('p-2 outline-0 ring-0 border-0', {
                'ring-2 ring-gray-400': menu.bar.is.focused(index),
                'ring-2 ring-green-500': menu.bar.is.selected(index),
              })}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
