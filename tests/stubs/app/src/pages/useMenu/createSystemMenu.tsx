import { defineComponent, Teleport } from 'vue'
import { useMenu, type Menu, type UseMenuOptions } from '../../../../../../src/combos'
import type { Orientation } from '../../../../../../src/extracted'

type SystemMenuProps = {
  options: string[]
}

const thing = {
  on: {
    firstPress: effect => effect(),
  }
}

thing.on.firstPress(() => {})

export function createSystemMenu<
  Multiselectable extends boolean = true,
  Clears extends boolean = true,
  O extends Orientation = 'vertical'
> (options: {
  menu?: UseMenuOptions<Multiselectable, Clears, O>,
  setup?: (
    props: Parameters<Parameters<typeof defineComponent<SystemMenuProps>>[0]['setup']>[0],
    ctx: Parameters<Parameters<typeof defineComponent<SystemMenuProps>>[0]['setup']>[1],
    features: { menu: Menu<Multiselectable, O> },
  ) => {
    getMeta: {
      menuButtonRoot?: () => Parameters<Menu<Multiselectable, O>['button']['root']['ref']>[0],
      menuBarRoot?: () => Parameters<Menu<Multiselectable, O>['bar']['root']['ref']>[0],
      menuBarItem?: (index: number) => Parameters<Menu<Multiselectable, O>['bar']['items']['ref']>[1],
    },
  },
}) {
  const { setup } = options

  return defineComponent<SystemMenuProps>({
    props: ['options'],
    name: 'SystemMenu',
    setup (props, ctx) {
      const menu = useMenu(options.menu)

      const {
        getMeta: {
          menuButtonRoot: getMenuButtonRootMeta,
          menuBarRoot: getMenuBarRootMeta,
          menuBarItem: getMenuBarItemMeta,
        },
      } = setup(props, ctx, { menu })

      return () => (
        <>
          <button ref={menu.button.root.ref(getMenuButtonRootMeta?.())}>Open menu</button>
          <Teleport to="body">
            {!menu.bar.is.removed() && (
              <div
                ref={menu.bar.root.ref(getMenuBarRootMeta?.())}
                class="flex flex-col max-w-md fixed top-1/2 left-1/2"
              >
                {props.options.map((option, index) => (
                  <div
                    key={option}
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
                    <span>{option}</span>
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
