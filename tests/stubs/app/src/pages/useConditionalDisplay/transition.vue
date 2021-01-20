<template>
  <button type="button" @click="toggle">toggle</button>
  <div ref="stub">useConditionalDisplay</div>
</template>

<script>
import { ref, shallowRef, watch, nextTick } from 'vue'
import { useConditionalDisplay } from '/@src/affordances'
import { useAnimateable } from '@baleada/vue-composition'


export default {
  setup () {
    const stub = ref(null),
          isShown = ref(true),
          toggle = () => {
            isShown.value = !isShown.value
          },
          spin = useAnimateable(
            [
              { progress: 0, data: { rotate: 0 } },
              { progress: 1, data: { rotate: 360 } },
            ],
            { duration: 1000 }
          ),
          fadeOut = useAnimateable(
            [
              { progress: 0, data: { opacity: 1 } },
              { progress: 1, data: { opacity: 0 } },
            ],
            { duration: 1000 }
          ),
          fadeIn = useAnimateable(
            [
              { progress: 0, data: { opacity: 0 } },
              { progress: 1, data: { opacity: 1 } },
            ],
            { duration: 1000 }
          ),
          stopWatchingSpinStatus = shallowRef(() => {}),
          stopWatchingFadeInStatus = shallowRef(() => {}),
          stopWatchingFadeOutStatus = shallowRef(() => {})

    useConditionalDisplay(
      { target: stub, condition: isShown },
      { 
        transition: {
          appear: {
            active (el, done) {
              stopWatchingSpinStatus.value = watch(
                [() => spin.value.status],
                () => {
                  if (spin.value.status === 'played') {
                    stopWatchingSpinStatus.value()
                    done()
                  }
                },
              )

              spin.value.play(({ data: { rotate } }) => (el.style.transform = `rotate(${rotate}deg)`))
            },
            cancel (el) {
              stopWatchingSpinStatus.value()
              spin.value.stop()
              el.style.opacity = 0
            },
          },
          enter: {
            active (el, done) {
              stopWatchingFadeInStatus.value = watch(
                [() => fadeIn.value.status],
                () => {
                  if (fadeIn.value.status === 'played') {
                    stopWatchingFadeInStatus.value()
                    done()
                  }
                },
              )

              fadeIn.value.play(({ data: { opacity } }) => (el.style.opacity = opacity))
            },
            cancel (el) {
              stopWatchingFadeInStatus.value()
              fadeIn.value.stop()
              el.style.opacity = 0
            },
          },
          leave: {
            active (el, done) {
              stopWatchingFadeOutStatus.value = watch(
                [() => fadeOut.value.status],
                () => {
                  if (fadeOut.value.status === 'played') {
                    stopWatchingFadeOutStatus.value()
                    done()
                  }
                },
              )

              fadeOut.value.play(({ data: { opacity } }) => (el.style.opacity = opacity))
            },
            cancel (el) {
              stopWatchingFadeOutStatus.value()
              fadeOut.value.stop()
              el.style.opacity = 1
            },
          },
        }
      }
    )

    window.TEST = { toggle }

    return { stub, isShown, toggle }
  }
}
</script>
