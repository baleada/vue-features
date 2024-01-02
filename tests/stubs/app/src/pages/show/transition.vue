<template>
  <button type="button" @click="toggle">toggle</button>
  <div ref="stub">show</div>
</template>

<script lang="ts">
import { defineComponent, ref, shallowRef, watch } from 'vue'
import { show } from '../../../../../../src/affordances/show'
import { useAnimateable } from '@baleada/vue-composition'


export default defineComponent({
  setup () {
    const stub = ref<HTMLElement>(null),
          isShown = ref(true),
          toggle = () => {
            isShown.value = !isShown.value
          },
          spin = useAnimateable(
            [
              { progress: 0, properties: { rotate: 0 } },
              { progress: 1, properties: { rotate: 360 } },
            ],
            { duration: 1000 }
          ),
          fadeOut = useAnimateable(
            [
              { progress: 0, properties: { opacity: 1 } },
              { progress: 1, properties: { opacity: 0 } },
            ],
            { duration: 1000 }
          ),
          fadeIn = useAnimateable(
            [
              { progress: 0, properties: { opacity: 0 } },
              { progress: 1, properties: { opacity: 1 } },
            ],
            { duration: 1000 }
          ),
          stopWatchingSpinStatus = shallowRef(() => {}),
          stopWatchingFadeInStatus = shallowRef(() => {}),
          stopWatchingFadeOutStatus = shallowRef(() => {})

    show(
      stub,
      isShown,
      { 
        transition: {
          appear: {
            active (done) {
              stopWatchingSpinStatus.value = watch(
                [() => spin.status],
                () => {
                  if (spin.status === 'played') {
                    stopWatchingSpinStatus.value()
                    done()
                  }
                },
              )

              spin.play(({ properties: { rotate: { interpolated: rotate } } }) => (stub.value.style.transform = `rotate(${rotate}deg)`))
            },
            cancel () {
              stopWatchingSpinStatus.value()
              spin.stop()
              stub.value.style.opacity = '0'
            },
          },
          enter: {
            active (done) {
              stopWatchingFadeInStatus.value = watch(
                [() => fadeIn.status],
                () => {
                  if (fadeIn.status === 'played') {
                    stopWatchingFadeInStatus.value()
                    done()
                  }
                },
              )

              fadeIn.play(({ properties: { opacity: { interpolated: opacity } } }) => (stub.value.style.opacity = `${opacity}`))
            },
            cancel () {
              stopWatchingFadeInStatus.value()
              fadeIn.stop()
              stub.value.style.opacity = '0'
            },
          },
          leave: {
            active (done) {
              stopWatchingFadeOutStatus.value = watch(
                [() => fadeOut.status],
                () => {
                  if (fadeOut.status === 'played') {
                    stopWatchingFadeOutStatus.value()
                    done()
                  }
                },
              )

              fadeOut.play(({ properties: { opacity: { interpolated: opacity } } }) => (stub.value.style.opacity = `${opacity}`))
            },
            cancel () {
              stopWatchingFadeOutStatus.value()
              fadeOut.stop()
              stub.value.style.opacity = '1'
            },
          },
        }
      }
    )

    window.testState =  { toggle }

    return { stub, isShown, toggle }
  }
})
</script>
