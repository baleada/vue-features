import { defineComponent, Teleport } from 'vue'
import { useMenu, type Menu as UsedMenu, type UseMenuOptions } from '../../../../../../src/combos'
import { Orientation } from '../../../../../../src/extracted'

export function defineMenuProps<
  Multiselectable extends boolean = true,
  Clears extends boolean = true,
  O extends Orientation = 'vertical',
  ItemType extends any = string
> (props: MenuProps<Multiselectable, Clears, O, ItemType>) {
  return props
}

export type MenuProps<
  Multiselectable extends boolean = true,
  Clears extends boolean = true,
  O extends Orientation = 'vertical',
  ItemType extends any = string
> = {
  items: ItemType[],
  toItemKey: (item: ItemType) => string,
  menu: UseMenuOptions<Multiselectable, Clears, O>,
  getMeta: {
    menuButtonRoot?: () => UsedMenu<Multiselectable, O>['button']['root']['meta']['value'],
    menuBarRoot?: () => UsedMenu<Multiselectable, O>['bar']['root']['meta']['value'],
    menuBarItem?: (index: number) => UsedMenu<Multiselectable, O>['bar']['items']['meta']['value'][number],
  },
  extend: (features: { menu: UsedMenu<Multiselectable, O> }) => void,
}

function setup<
  Multiselectable extends boolean = true,
  Clears extends boolean = true,
  O extends Orientation = 'vertical',
  ItemType extends any = string
>(
  props: MenuProps<Multiselectable, Clears, O, ItemType>,
  ctx: Parameters<
    Parameters<
      typeof defineComponent<
        MenuProps<Multiselectable, Clears, O, ItemType>
      >
    >[0]['setup']
  >[1]
) {
  const { slots } = ctx
  const menu = useMenu(props.menu)

  props.extend?.({ menu })

  return () => (
    <>
      {slots.label({ menu })}
      <slot name="label" menu={menu} />
      <button ref={menu.button.root.ref(props.getMeta?.menuButtonRoot?.())}>
        {slots['button-label']({ menu })}
      </button>
      <Teleport to="body">
        {!menu.bar.is.removed() && (
          <div
            ref={menu.bar.root.ref(props.getMeta?.menuBarRoot?.())}
            class="flex flex-col max-w-md fixed top-1/2 left-1/2"
          >
            {props.items.map((item, index) => (
              <div
                key={(props.toItemKey || JSON.stringify)(item)}
                ref={menu.bar.items.ref(index, {
                  kind: [2, 3].includes(index)
                    ? 'checkbox'
                    : [4, 5].includes(index)
                    ? 'radio'
                    : 'item',
                  group: [4, 5].includes(index) ? 'my-radio-group' : undefined,
                  ...props.getMeta?.menuBarItem?.(index),
                })}
                class={[
                  'p-2 outline-0 ring-0 border-0 flex gap-2 items-center',
                  { 'ring-2 ring-gray-400': menu.bar.is.focused(index) },
                ]}
              >
                {slots.item({ menu, item, index })}
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
}

export const Menu = defineComponent(
  setup,
  {
    props: ['items', 'toItemKey', 'menu', 'getMeta', 'extend'],
    name: 'Menu',
  }
)
