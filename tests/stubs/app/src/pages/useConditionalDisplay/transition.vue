<template>
  <button type="button" @click="toggle">toggle</button>
  <span ref="stub">useConditionalDisplay</span>
</template>

<script>
import { ref, watch, nextTick } from 'vue'
import { useConditionalDisplay } from '/@src/affordances'
import { useAnimateable } from '@baleada/vue-composition'


export default {
  setup () {
    const stub = ref(null),
          isShown = ref(true),
          toggle = () => {
            isShown.value = !isShown.value
          },
          fadeOut = useAnimateable(
            [
              { progress: 0, data: { opacity: 1 } },
              { progress: 1, data: { opacity: 0 } },
            ],
            { duration: 2500 }
          ),
          fadeIn = useAnimateable(
            [
              { progress: 0, data: { opacity: 0 } },
              { progress: 1, data: { opacity: 1 } },
            ],
            { duration: 2500 }
          )

    useConditionalDisplay(
      { target: stub, condition: isShown },
      { 
        transition: {
          enter: (el, done, onCancel) => {
            onCancel(() => {
              stopWatchingStatus()
              fadeIn.value.stop()
              el.style.opacity = 0
            })

            const stopWatchingStatus = watch(
              [() => fadeIn.value.status],
              () => {
                if (fadeIn.value.status === 'played') {
                  stopWatchingStatus()
                  done()
                }
              }
            )

            fadeIn.value.play(({ data: { opacity } }) => (el.style.opacity = opacity))
          },
          exit: (el, done, onCancel) => {
            onCancel(() => {
              stopWatchingStatus()
              fadeOut.value.stop()
              el.style.opacity = 1
            })

            const stopWatchingStatus = watch(
              [() => fadeOut.value.status],
              () => {
                if (fadeOut.value.status === 'played') {
                  stopWatchingStatus()
                  done()
                }
              }
            )

            fadeOut.value.play(({ data: { opacity } }) => (el.style.opacity = opacity))
          },
        }
      }
    )

    window.TEST = { toggle }

    return { stub, isShown, toggle }
  }
}
</script>
