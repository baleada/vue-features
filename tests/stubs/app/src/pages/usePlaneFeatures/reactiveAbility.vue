<template>
  <div class="flex-col/5">
    <span class="sr-only" :ref="label.ref()">
      Mulago Foundation portfolio
    </span>
    <span
      v-if="variant === 'described'"
      class="sr-only"
      :ref="description.ref()"
    >
      Select the organization you want to donate to
    </span>
    <ul
      :ref="listbox.root.ref({
        labelledBy: label.id.value,
        ...(variant === 'described' && {
          describedBy: description.id.value,
        }),
        ability: rootAbility,
        validity: 'invalid',
      })"
      class="
        mt-0
        ring-sh-2-gray-300 dork:ring-primary-gray-1000
        rounded-3 list-none scrollbar-hide select-none whitespace-nowrap
      "
      :class="[
        variant === 'configured'
          ? 'flex overflow-x-scroll'
          : 'flex-col overflow-y-scroll',
        listbox.is.disabled() && 'cursor-not-allowed',
        listbox.is.invalid() && 'ring-inset ring-2 ring-red-500 dork:ring-primary-red-500',
      ]"
    >
      <li
        v-for="(name, index) in options"
        :ref="listbox.options.ref(index, { ability: ability[index] })"
        class="
          mt-0 before:content-['']
          text-4
          focus:bg-green-200 dork:focus:bg-primary-gray-1000
        "
        :class="[
          variant === 'configured'
            ? 'p-3 flex-col-reverse/2 center-all-x'
            : 'flex/2 center-all-y px-2 py-1.5',
          listbox.is.disabled(index)
            ? `
              text-gray-600 dork:text-gray-500
              bg-gray-100 dork:bg-primary-gray-130
              cursor-not-allowed
            `
            : `
              text-gray-900 dork:text-gray-400
              hover:bg-gray-200  dork:hover:bg-primary-gray-1000
            `
        ]"
      >
        <span v-if="variant === 'configured'">{{ listbox.is.disabled(index) && '(disabled)' }}</span>
        <div class="flex/2">
          <div class="relative">
            <span
              aria-hidden="true"
              class="text-primary-70 transition duration-1"
              :class="[
                listbox.is.selected(index) && !listbox.is.disabled(index)
                  ? 'opacity-1 scale-100'
                  : 'opacity-0 scale-[92%]',
              ]"
            >check</span>
            <span
              aria-hidden="true"
              class="absolute center text-gray-400 dork:text-gray-500 transition duration-1"
              :class="[
                listbox.is.disabled(index)
                  ? 'opacity-1 scale-100'
                  : 'opacity-0 scale-[92%]',
              ]"
            >circle slash</span>
          </div>
        </div>
        <span>{{ name }}</span>
        <span v-if="variant !== 'configured'">{{ listbox.is.disabled(index) && '(disabled)' }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="tsx">
import { computed } from 'vue'
import { pipe } from 'lazy-collections'
import { names } from '@alexvipond/mulago'
import {
  useListbox,
  useTextbox,
} from '../../../../../../src/interfaces'
import {
  useElementApi,
} from '../../../../../../src/extracted'
import { createUnique, createMap } from '@baleada/logic'

const props = defineProps<{
 variant: (
  | 'default'
  | 'described'
  | 'configured'
  | 'dynamic'
 )
}>()

const options = names.slice(0, 10).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())),
      listbox = useListbox({
        multiselectable: true,
        disabledOptionsReceiveFocus: true,
        loops: true,
        ...(props.variant === 'configured' && {
          orientation: 'horizontal',
          disabledOptionsReceiveFocus: true,
          clears: false,
          initialSelected: 0,
          loops: false,
        }),
      }),
      label = useElementApi({ identifies: true }),
      description = useElementApi({ identifies: true }),
      disabled = useTextbox(),
      unique = createUnique(),
      toIndices = createMap<string, number>(index => Number(index.trim())),
      ability = computed(() => {
        if (props.variant !== 'dynamic') {
          return options.map((_, index) => index % 4 === 0 ? 'disabled' : 'enabled')
        } 

        const indices = pipe(
          s => s.split(','),
          toIndices,
          unique,
        )(disabled.text.string) as number[]

        return options.map((_, index) => indices.includes(index) ? 'disabled' : 'enabled')
      }),
      rootAbility = 'disabled' //, computed(() => props.variant === 'dynamic' ? 'enabled' : 'disabled')

</script>
