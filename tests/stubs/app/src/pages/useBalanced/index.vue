<template>
  <div class="flex flex-col p-6 gap-6">
    <div class="flex">
      <div style="position: relative; font-size: 40px">
        <span>{{ text }}</span>
      </div>
    </div>
    <div class="flex">
      <div ref="textContainer" style="position: relative; font-size: 40px">
        <span class="text-transparent">{{ text }}</span>
        <span
          :ref="textBalanced.root.ref()"
          :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            maxWidth: '100%',
            width: `${textBalanced.width.value}px`,
          }"
          class="text-indigo-600"
        >{{ text }}</span>
      </div>
    </div>
    <div class="flex">
      <div class="relative w-full">
        <div class="flex flex-wrap gap-2 w-full opacity-40">
          <div v-for="shape in shapes" class="h-10" :style="{ width: `${shape}px` }" :class="[colors[shape % colors.length]]"></div>
        </div>
      </div>
    </div>
    <div class="flex">
      <div ref="shapesContainer" class="relative w-full">
        <div class="flex flex-wrap gap-2 w-full opacity-0">
          <div v-for="shape in shapes" class="h-10" :style="{ width: `${shape}px` }" :class="[colors[shape % colors.length]]"></div>
        </div>
        <div :ref="shapesBalanced.root.ref()" class="flex flex-wrap gap-2 absolute top-0 left-0 opacity-0">
          <div v-for="shape in shapes" class="h-10" :style="{ width: `${shape}px`, backgroundColor: colors[shape % colors.length] }"></div>
        </div>
        <div class="flex flex-wrap gap-2 absolute top-0 left-0" :style="{
          maxWidth: '100%',
          width: `${shapesBalanced.width.value}px`
        }">
          <div v-for="shape in shapes" class="h-10 origin-center" :style="{ width: `${shape}px` }" :class="[colors[shape % colors.length]]"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBalanced } from '../../../../../../src/extensions/useBalanced'

const textContainer = ref<HTMLElement>()
const textBalanced = useBalanced(textContainer)
const text = ref(`Baleada: a toolkit for building web apps.`)

const shapesContainer = ref<HTMLElement>()
const shapesBalanced = useBalanced(shapesContainer, { precision: 10, effort: 5 })
const shapes = new Array(15).fill(0).map(() => Math.round(Math.random() * 100))
const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-indigo-500', 'bg-violet-600']
</script>
