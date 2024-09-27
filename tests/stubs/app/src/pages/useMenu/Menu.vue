<template>
  <div>
    <slot name="label" :menu="menu" />
    <button :ref="menu.button.root.ref(getMeta?.menuButtonRoot?.())">
      <slot name="button-label" :menu="menu" />
    </button>
    <Teleport to="body">
      <div
        v-if="!menu.bar.is.removed()"
        :ref="menu.bar.root.ref(getMeta?.menuBarRoot?.())"
        class="flex flex-col max-w-md fixed top-1/2 left-1/2"
      >
        <div
          v-for="(item, index) in items"
          :key="(toItemKey || JSON.stringify)(item)"
          :ref="menu.bar.items.ref(index, {
            kind: [2, 3].includes(index)
              ? 'checkbox'
              : [4, 5].includes(index)
              ? 'radio'
              : 'item',
            group: [4, 5].includes(index) ? 'my-radio-group' : undefined,
            ...props.getMeta?.menuBarItem?.(index),
          })"
          :class="[
            'p-2 outline-0 ring-0 border-0 flex gap-2 items-center',
            { 'ring-2 ring-gray-400': menu.bar.is.focused(index) }
          ]"
        >
          <slot name="item" :menu="menu" :item="item" :index="index" />
          <span v-if="[2, 3].includes(index) && menu.bar.is.selected(index)" aria-hidden="true">✅</span>
          <span v-if="[4, 5].includes(index) && menu.bar.is.selected(index)" aria-hidden="true">🔘</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script
  setup
  lang="ts"
  generic="
    Multiselectable extends boolean = true,
    Clears extends boolean = true,
    O extends Orientation = 'vertical',
    ItemType extends any = string
  "
>
import { Teleport } from 'vue'
import { useMenu, type UseMenuOptions, type Menu } from '../../../../../../src/combos'
import type { Orientation } from '../../../../../../src/extracted'

export type MenuProps<
  Multiselectable extends boolean = true,
  Clears extends boolean = true,
  O extends Orientation = 'vertical',
  ItemType extends any = string
> = {
  items: ItemType[],
  toItemKey?: (item: ItemType) => string,
  menu?: UseMenuOptions<Multiselectable, Clears, O>,
  getMeta?: {
    menuButtonRoot?: () => Menu<Multiselectable, O>['button']['root']['meta']['value'],
    menuBarRoot?: () => Menu<Multiselectable, O>['bar']['root']['meta']['value'],
    menuBarItem?: (index: number) => Menu<Multiselectable, O>['bar']['items']['meta']['value'][number],
  },
  extend?: (features: { menu: Menu<Multiselectable, O> }) => void,
}

const props = defineProps<
  MenuProps<Multiselectable, Clears, O, ItemType>
>()

const emit = defineEmits<{
  setup: [features: { menu: Menu<Multiselectable, O> }],
}>()

const menu = useMenu(props.menu)

emit('setup', { menu })
</script>
