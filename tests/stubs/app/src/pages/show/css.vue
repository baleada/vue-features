<template>
  <button type="button" @click="toggle">toggle</button>
  <div ref="stub">show</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { show } from '../../../../../../src/affordances/show'
import { WithGlobals } from '../../../../../fixtures/types'


export default defineComponent({
  setup () {
    const stub = ref<HTMLElement>(null),
          isShown = ref(true),
          toggle = () => {
            isShown.value = !isShown.value
          }

    show(
      stub,
      isShown,
      { 
        transition: {
          appear: defineTransition => defineTransition('css', {
            from: 'appear-from',
            active: 'appear-active',
            to: 'appear-to',
          }),
          enter: defineTransition => defineTransition('css', {
            from: 'enter-from',
            active: 'enter-active',
            to: 'enter-to',
          }),
          leave: defineTransition => defineTransition('css', {
            from: 'leave-from',
            active: 'leave-active',
            to: 'leave-to',
          }),
        }
      }
    );

    (window as unknown as WithGlobals).testState =  { toggle }

    return { stub, isShown, toggle }
  }
})
</script>

<style>
.enter-from {
  background-color: red;
  transform: rotate(180deg); 
}

.enter-active {
  transition: all 2s ease-in-out;
}

.enter-to {
  background-color: blue;
  transform: rotate(0deg); 
}

.appear-from {
  background-color: pink;
  transform: translateX(100px); 
}

.appear-active {
  transition: all 2s ease-in-out;
}

.appear-to {
  background-color: turquoise;
  transform: translateX(-100px); 
}

.leave-from {
  background-color: purple;
  transform: rotate(0deg); 
}

.leave-active {
  transition: all 2s ease-in-out;
}

.leave-to {
  background-color: green;
  transform: rotate(180deg);
}
</style>
