<template>
  <button type="button" @click="() => show(0)">show 0</button>
  <button type="button" @click="() => show(1)">show 1</button>
  <!-- <button type="button" @click="() => show(2)">show 2</button> -->
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
      <!-- <div style="position: absolute; top: 0; left: 0;" :ref="three">2</div> -->
      <div style="opacity: 0;">three</div>
    </div>
  </div>
</template>

<script>
import { ref, computed, shallowRef, watch, nextTick } from 'vue'
import { useConditionalDisplay } from '/@src/affordances'
import { useAnimateable } from '@baleada/vue-composition'


export default {
  setup () {
    const els = ref([]),
          one = el => els.value[0] = el,
          two = el => els.value[1] = el,
          three = el => els.value[2] = el,
          shown = ref(0),
          show = index => shown.value = index,
          spinCreate = () => useAnimateable(
            [
              { progress: 0, data: { rotate: 0 } },
              { progress: 1, data: { rotate: 360 } },
            ],
            { duration: 1000 }
          ),
          fadeOutCreate = () => useAnimateable(
            [
              { progress: 0, data: { color: 'blue' } },
              { progress: 1, data: { color: 'red' } },
            ],
            { duration: 150 }
          ),
          fadeInCreate = () => useAnimateable(
            [
              { progress: 0, data: { color: 'red' } },
              { progress: 1, data: { color: 'blue' } },
            ],
            { duration: 150 }
          ),
          transitionMetadata = (new Array(3))
            .fill({
              spin: spinCreate(),
              fadeIn: fadeInCreate(),
              fadeOut: fadeOutCreate(),
              stopWatchingSpinStatus: shallowRef(() => {}),
              stopWatchingFadeInStatus: shallowRef(() => {}),
              stopWatchingFadeOutStatus: shallowRef(() => {}),
            })
            .map((metadatum, index) => ({ ...metadatum, el: computed(() => els.value[index]) }))

    useConditionalDisplay(
      {
        target: els,
        condition: {
          targetClosure: ({ index }) => shown.value === index,
          watchSources: shown,
        }
      },
      { 
        transition: {
          appear: {
            active: ({ target, index, done }) => {

              transitionMetadata[index].stopWatchingSpinStatus.value = watch(
                [() => transitionMetadata[index].spin.value.status],
                () => {
                  if (transitionMetadata[index].spin.value.status === 'played') {
                    transitionMetadata[index].stopWatchingSpinStatus.value()
                    done()
                  }
                },
              )
  
              nextTick(() => transitionMetadata[index].spin.value.play(({ data: { rotate } }) => (target.style.transform = `rotate(${rotate}deg)`)))
            },
            cancel: ({ target, index }) => {
              transitionMetadata[index].stopWatchingSpinStatus.value()
              transitionMetadata[index].spin.value.stop()
              target.style.color = 'red'
            }
          },
          enter: {
            active: ({ target, index, done }) => {
              transitionMetadata[index].stopWatchingFadeInStatus.value = watch(
                [() => transitionMetadata[index].fadeIn.value.status],
                () => {
                  if (transitionMetadata[index].fadeIn.value.status === 'played') {
                    transitionMetadata[index].stopWatchingFadeInStatus.value()
                    done()
                  }
                },
              )
  
              nextTick(() => transitionMetadata[index].fadeIn.value.play(({ data: { color } }) => {
                console.log('%c' + target.textContent, 'color: ' + color)
                target.style.color = color
              }))
            },
            cancel: ({ target, index }) => {
              transitionMetadata[index].stopWatchingFadeInStatus.value()
              transitionMetadata[index].fadeIn.value.stop()
              target.style.color = 'red'
            }
          },
          leave: {
            active: ({ target, index, done }) => {
              
              transitionMetadata[index].stopWatchingFadeOutStatus.value = watch(
                [() => transitionMetadata[index].fadeOut.value.status],
                () => {
                  if (transitionMetadata[index].fadeOut.value.status === 'played') {
                    console.log('leave.active.watch', target.textContent)
                    transitionMetadata[index].stopWatchingFadeOutStatus.value()
                    done()
                  }
                },
              )
  
              nextTick(() => transitionMetadata[index].fadeOut.value.play(({ data: { color } }) => {
                console.log('%c' + target.textContent, 'color: ' + color)
                target.style.color = color
              }))
            },
            cancel: ({ target, index }) => {
              transitionMetadata[index].stopWatchingFadeOutStatus.value()
              transitionMetadata[index].fadeOut.value.stop()
              target.style.color = 'blue'
            },
          },
        }
      }
    )

    window.TEST = { show }

    return {
      one,
      two,
      three,
      show,
    }
  }
}
</script>
