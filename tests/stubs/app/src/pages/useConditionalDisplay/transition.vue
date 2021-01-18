<template>
  <span ref="stub">useConditionalDisplay</span>
</template>

<script>
import { ref, watch } from 'vue'
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
            { duration: 1250 }
          ),
          fadeIn = useAnimateable(
            [
              { progress: 0, data: { opacity: 0 } },
              { progress: 1, data: { opacity: 1 } },
            ],
            { duration: 1250 }
          )

    useConditionalDisplay(
      { target: stub, condition: isShown },
      { 
        transition: {
          enter: (el, done, isCanceled) => {
            const stop = watch(
              [() => fadeIn.value.status],
              () => {
                if (fadeIn.value.status === 'played') {
                  stop()
                  done()
                }
              }
            )

            fadeIn.value.play(({ data: { opacity } }) => {
              // console.log({ fadeIn: isCanceled.value })
              if (isCanceled.value) {
                console.log('enter cancel')
                fadeIn.value.stop()
                el.style.opacity = 0
                done()
                return
              }

              el.style.opacity = opacity
            })
          },
          exit: (el, done, isCanceled) => {
            const stop = watch(
              [() => fadeOut.value.status],
              () => {
                if (fadeOut.value.status === 'played') {
                  stop()
                  done()
                }
              }
            )

            fadeOut.value.play(({ data: { opacity } }) => {
              // console.log({ fadeOut: isCanceled.value })
              if (isCanceled.value) {
                console.log('exit cancel')
                fadeOut.value.stop()
                el.style.opacity = 1
                done()
                return
              }

              el.style.opacity = opacity
            })
          },
        }
      }
    )

    window.TEST = { toggle }

    return { stub, isShown }
  }
}
</script>
