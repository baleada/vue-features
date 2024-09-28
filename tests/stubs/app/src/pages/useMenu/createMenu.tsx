import { defineComponent, Teleport, unref, type Ref } from 'vue'
import { useMenu, type Menu, type UseMenuOptions } from '../../../../../../src/combos'
import { Orientation } from '../../../../../../src/extracted'

export function createMenu<
  Multiselectable extends boolean = true,
  Clears extends boolean = true,
  O extends Orientation = 'vertical',
  ItemType extends any = string
> (hocProps: {
  items: ItemType[] | Ref<ItemType[]>,
  toItemKey?: (item: ItemType) => string,
  menu?: UseMenuOptions<Multiselectable, Clears, O>,
  getMeta?: {
    menuButtonRoot?: () => Menu<Multiselectable, O>['button']['root']['meta']['value'],
    menuBarRoot?: () => Menu<Multiselectable, O>['bar']['root']['meta']['value'],
    menuBarItem?: (index: number) => Menu<Multiselectable, O>['bar']['items']['meta']['value'][number],
  },
  extend?: (features: { menu: Menu<Multiselectable, O> }) => void,
}) {
  const {
    items,
    toItemKey = (...params) => JSON.stringify(params),
    extend,
    getMeta: {
      menuButtonRoot: getMenuButtonRootMeta,
      menuBarRoot: getMenuBarRootMeta,
      menuBarItem: getMenuBarItemMeta,
    } = { getMeta: {} },
  } = hocProps

  return defineComponent({
    name: 'Menu',
    setup (props, ctx) {
      const { slots } = ctx
      const menu = useMenu(hocProps.menu)

      extend?.({ menu })

      return () => (
        <>
          {slots.label({ menu })}
          <slot name="label" menu={menu} />
          <button ref={menu.button.root.ref(getMenuButtonRootMeta?.())}>
            {slots['button-label']({ menu })}
          </button>
          <Teleport to="body">
            {!menu.bar.is.removed() && (
              <div
                ref={menu.bar.root.ref(getMenuBarRootMeta?.())}
                class="flex flex-col max-w-md fixed top-1/2 left-1/2"
              >
                {unref(items).map((item, index) => (
                  <div
                    key={toItemKey(item)}
                    ref={menu.bar.items.ref(index, {
                      kind: [2, 3].includes(index)
                        ? 'checkbox'
                        : [4, 5].includes(index)
                        ? 'radio'
                        : 'item',
                      group: [4, 5].includes(index) ? 'my-radio-group' : undefined,
                      ...getMenuBarItemMeta?.(index),
                    })}
                    class={[
                      'p-2 outline-0 ring-0 border-0 flex gap-2 items-center',
                      { 'ring-2 ring-gray-400': menu.bar.is.focused(index) },
                    ]}
                  >
                    {slots.item({ item, menu, index })}
                    {[2, 3].includes(index) && menu.bar.is.selected(index) && (
                      <span aria-hidden="true">✅</span>
                    )}
                    {[4, 5].includes(index) && menu.bar.is.selected(index) && (
                      <span aria-hidden="true">🔘</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Teleport>
        </>
      )
    },
  })
}
