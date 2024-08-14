<template>
  <!-- focus target for tests -->
  <input type="text" />
  <div
    :ref="listbox.root.ref()"
    class="h-[90vh] flex p-0.5 select-none text-black"
    :class="{
      'flex-col overflow-y-scroll mx-auto w-64': orientation === 'vertical',
      'flex-wrap': orientation === 'horizontal',
    }"
  >
    <div
      v-for="(option, index) in listData"
      :ref="listbox.options.ref(
        index,
        {
          // kind: row === 0 ? 'rowheader' : 'cell',
          // ability: /[Ff,zxq]/.test(cell) ? 'disabled' : 'enabled',
        }
      )"
      class="relative flex items-center text-left h-12 p-4 focus:outline-none"
      :class="[
        index === listbox.superselected.value[0]
          ? 'bg-zinc-50'
          : toCellBg(listbox.total.selected(index)),
        (
          (!listbox.superselected.value.length && listbox.is.focused(index))
          || index === superselectedBounds.max
        ) && 'after:z-20 after:w-1.5 after:h-1.5 after:rounded-sm after:bg-green-800 after:absolute after:bottom-0 after:right-0 after:translate-y-1/2 after:translate-x-1/2 after:ring-1 after:ring-white',
        listbox.is.disabled(index) && 'opacity-50 text-red-600'
      ]"
    >
      <span>{{ option }}</span>
      <span
        class="w-full h-px absolute top-0 left-0 -translate-y-1/2"
        :class="[toCellBorder(listbox.total.selected(index))]"
      ></span>
      <span
        class="w-full h-px absolute bottom-0 left-0 translate-y-1/2"
        :class="[toCellBorder(listbox.total.selected(index))]"
      ></span>
      <span
        class="w-px h-full absolute top-0 left-0 -translate-x-1/2"
        :class="[toCellBorder(listbox.total.selected(index))]"
      ></span>
      <span
        class="w-px h-full absolute top-0 right-0 translate-x-1/2"
        :class="[toCellBorder(listbox.total.selected(index))]"
      ></span>
      <span
        v-show="
          (!listbox.superselected.value.length && listbox.is.focused(index))
          || (
            listbox.is.superselected(index)
            && (
              orientation === 'horizontal'
              || (orientation === 'vertical' && index === superselectedBounds.min)
            )
          )
        "
        class="z-10 w-full h-0.5 absolute top-0 left-0 -translate-y-1/2 bg-green-800"
      ></span>
      <span
        v-show="
          (!listbox.superselected.value.length && listbox.is.focused(index))
          || (
            listbox.is.superselected(index)
            && (
              orientation === 'horizontal'
              || (orientation === 'vertical' && index === superselectedBounds.max)
            )
          )
        "
        class="z-10 w-full h-0.5 absolute bottom-0 left-0 translate-y-1/2 bg-green-800"
      ></span>
      <span
        v-show="
          (!listbox.superselected.value.length && listbox.is.focused(index))
          || (
            listbox.is.superselected(index)
            && (
              orientation === 'vertical'
              || (orientation === 'horizontal' && index === superselectedBounds.min)  
            )
          )
        "
        class="z-10 w-0.5 h-full absolute top-0 left-0 -translate-x-1/2 bg-green-800"
      ></span>
      <span
        v-show="
          (!listbox.superselected.value.length && listbox.is.focused(index))
          || (
            listbox.is.superselected(index)
            && (
              orientation === 'vertical'
              || (orientation === 'horizontal' && index === superselectedBounds.max)
            )
          )
        "
        class="z-10 w-0.5 h-full absolute top-0 right-0 translate-x-1/2 bg-green-800"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useListbox } from '../../../../../../src/interfaces'
import { portfolio } from '@alexvipond/mulago-foundation-portfolio'
import { getOptions } from '../../getParam'
import { computed } from 'vue';
import { min, max } from 'lazy-collections'

const listData = portfolio.map(({ name }) => name)

const options = getOptions()
const { orientation = 'vertical' } = options
const listbox = useListbox({
  ...getOptions(),
  multiselectable: true,
})

const superselectedBounds = computed(() => ({
  min: min()(listbox.superselected.value),
  max: max()(listbox.superselected.value),
}))

function toCellBg (total: number) {
  switch (total) {
    case 0: return 'bg-transparent'
    case 1: return 'bg-zinc-300'
    case 2: return 'bg-zinc-400'
    case 3: return 'bg-zinc-500'
    case 4: return 'bg-zinc-600'
    case 5: return 'bg-zinc-700'
    case 6: return 'bg-zinc-800'
    case 7: return 'bg-zinc-900'
    default: return 'bg-zinc-950'
  }
}

function toCellBorder (total: number) {
  switch (total) {
    case 0: return 'bg-zinc-300'
    case 1: return 'bg-zinc-400'
    case 2: return 'bg-zinc-500'
    case 3: return 'bg-zinc-600'
    case 4: return 'bg-zinc-700'
    case 5: return 'bg-zinc-800'
    case 6: return 'bg-zinc-900'
    case 7: return 'bg-zinc-950'
    default: return 'bg-black'
  }
}

window.testState =  { listbox }
</script>
