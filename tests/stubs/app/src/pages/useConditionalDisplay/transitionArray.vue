<template>
  <button type="button" @click="() => show(0)">show 0</button>
  <button type="button" @click="() => show(1)">show 1</button>
  <button type="button" @click="() => show(2)">show 2</button>
  <div>
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

<script>
import { ref, shallowRef, watch, nextTick } from 'vue'
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
          fadeOut = useAnimateable(
            [
              { progress: 0, data: { opacity: 1 } },
              { progress: 1, data: { opacity: 0 } },
            ],
            { duration: 150 }
          ),
          fadeIn = useAnimateable(
            [
              { progress: 0, data: { opacity: 0 } },
              { progress: 1, data: { opacity: 1 } },
            ],
            { duration: 150 }
          ),
          stopWatchingStatus = shallowRef(() => {})

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
          enter: {
            active: (el, done) => {
              stopWatchingStatus.value = watch(
                [() => fadeIn.value.status],
                () => {
                  if (fadeIn.value.status === 'played') {
                    stopWatchingStatus.value()
                    done()
                  }
                },
              )
  
              nextTick(() => fadeIn.value.play(({ data: { opacity } }) => (el.style.opacity = opacity)))
            },
            cancel: el => {
              stopWatchingStatus.value()
              fadeIn.value.stop()
              el.style.opacity = 0
            }
          },
          leave: {
            active: (el, done) => {
              stopWatchingStatus.value = watch(
                [() => fadeOut.value.status],
                () => {
                  if (fadeOut.value.status === 'played') {
                    stopWatchingStatus.value()
                    done()
                  }
                },
              )
  
              nextTick(() => fadeOut.value.play(({ data: { opacity } }) => (el.style.opacity = opacity)))
            },
            cancel: el => {
              stopWatchingStatus.value()
              fadeOut.value.stop()
              el.style.opacity = 1
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
