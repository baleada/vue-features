<template>
  <button type="button" @click="() => setShown(0)">show 0</button>
  <button type="button" @click="() => setShown(1)">show 1</button>
  <button type="button" @click="() => setShown(2)">show 2</button>
  <div style="font-size: 52px;">
    <div style="position: relative;">
      <div style="position: absolute; top: 0; left: 0;" :ref="one">0</div>
      <div style="opacity: 0;">one</div>
    </div>
    <div style="position: relative;">
      <div style="position: absolute; top: 0; left: 0;" :ref="two">1</div>
      <div style="opacity: 0;">two</div>
    </div>
    <div style="position: relative;">
      <div style="position: absolute; top: 0; left: 0;" :ref="three">2</div>
      <div style="opacity: 0;">three</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick } from 'vue'
import { show } from '../../../../../../src/affordances/show'
import { useAnimateable } from '@baleada/vue-composition'
import { WithGlobals } from '../../../../../fixtures/types'


export default defineComponent({
  setup () {
    const els = ref<HTMLElement[]>([]),
          one = el => els.value[0] = el,
          two = el => els.value[1] = el,
          three = el => els.value[2] = el,
          shown = ref(0),
          setShown = index => shown.value = index,
          spinCreate = () => useAnimateable(
            [
              { progress: 0, properties: { rotate: 0 } },
              { progress: 1, properties: { rotate: 360 } },
            ],
            { duration: 1000 }
          ),
          fadeOutCreate = () => useAnimateable(
            [
              { progress: 0, properties: { color: 'blue' } },
              { progress: 1, properties: { color: 'red' } },
            ],
            { duration: 150 }
          ),
          fadeInCreate = () => useAnimateable(
            [
              { progress: 0, properties: { color: 'red' } },
              { progress: 1, properties: { color: 'blue' } },
            ],
            { duration: 150 }
          ),
          transitionMetadata = (new Array(3))
            .fill({
              spin: spinCreate(),
              fadeIn: fadeInCreate(),
              fadeOut: fadeOutCreate(),
              stopWatchingSpinStatus: () => {},
              stopWatchingFadeInStatus: () => {},
              stopWatchingFadeOutStatus: () => {},
            })
            .map((metadatum, index) => ({ ...metadatum, index, el: computed(() => els.value[index]) }))

    show(
      els,
      {
        get: index => shown.value === index,
        watchSource: shown,
      },
      { 
        transition: {
          appear: {
            active: (index, done) => {
              transitionMetadata[index].stopWatchingSpinStatus = watch(
                [() => transitionMetadata[index].spin.value.status],
                () => {
                  if (transitionMetadata[index].spin.value.status === 'played') {
                    transitionMetadata[index].stopWatchingSpinStatus()
                    done()
                  }
                },
              )
  
              nextTick(() => transitionMetadata[index].spin.value.play(({ properties: { rotate } }) => (els.value[index].style.transform = `rotate(${rotate}deg)`)))
            },
            cancel: index => {
              transitionMetadata[index].stopWatchingSpinStatus()
              transitionMetadata[index].spin.value.stop()
              els.value[index].style.color = 'red'
            }
          },
          enter: {
            active: (index, done) => {
              transitionMetadata[index].stopWatchingFadeInStatus = watch(
                [() => transitionMetadata[index].fadeIn.value.status],
                () => {
                  if (transitionMetadata[index].fadeIn.value.status === 'played') {
                    transitionMetadata[index].stopWatchingFadeInStatus()
                    done()
                  }
                },
              )
  
              nextTick(() => transitionMetadata[index].fadeIn.value.play(({ properties: { color } }) => {
                els.value[index].style.color = color
              }))
            },
            cancel: index => {
              transitionMetadata[index].stopWatchingFadeInStatus()
              transitionMetadata[index].fadeIn.value.stop()
              els.value[index].style.color = 'red'
            }
          },
          leave: {
            active: (index, done) => {
              transitionMetadata[index].stopWatchingFadeOutStatus = watch(
                [() => transitionMetadata[index].fadeOut.value.status],
                () => {
                  if (transitionMetadata[index].fadeOut.value.status === 'played') {
                    transitionMetadata[index].stopWatchingFadeOutStatus()
                    done()
                  }
                },
              )
  
              nextTick(() => transitionMetadata[index].fadeOut.value.play(({ properties: { color } }) => {
                els.value[index].style.color = color
              }))
            },
            cancel: index => {
              transitionMetadata[index].stopWatchingFadeOutStatus()
              transitionMetadata[index].fadeOut.value.stop()
              els.value[index].style.color = 'blue'
            },
          },
        }
      }
    )

    ;(window as unknown as WithGlobals).testState =  { setShown }

    return {
      one,
      two,
      three,
      setShown,
    }
  }
})
</script>
