<template>
  <button type="button" @click="toggle">toggle</button>
  <div ref="stub">show</div>
</template>

<script lang="ts">
import { defineComponent, ref, shallowRef, watch } from 'vue'
import { show } from '../../../../../../src/affordances'
import { useAnimateable } from '@baleada/vue-composition'
import { WithGlobals } from '../../../../../fixtures/types'


export default defineComponent({
  setup () {
    const stub = ref(null),
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
      { element: stub, condition: isShown },
      { 
        transition: {
          appear: {
            active ({ element, done }) {
              stopWatchingSpinStatus.value = watch(
                [() => spin.value.status],
                () => {
                  if (spin.value.status === 'played') {
                    stopWatchingSpinStatus.value()
                    done()
                  }
                },
              )

              spin.value.play(({ properties: { rotate: { interpolated: rotate } } }) => (element.style.transform = `rotate(${rotate}deg)`))
            },
            cancel ({ element }) {
              stopWatchingSpinStatus.value()
              spin.value.stop()
              element.style.opacity = '0'
            },
          },
          enter: {
            active ({ element, done }) {
              stopWatchingFadeInStatus.value = watch(
                [() => fadeIn.value.status],
                () => {
                  if (fadeIn.value.status === 'played') {
                    stopWatchingFadeInStatus.value()
                    done()
                  }
                },
              )

              fadeIn.value.play(({ properties: { opacity: { interpolated: opacity } } }) => (element.style.opacity = `${opacity}`))
            },
            cancel ({ element }) {
              stopWatchingFadeInStatus.value()
              fadeIn.value.stop()
              element.style.opacity = '0'
            },
          },
          leave: {
            active ({ element, done }) {
              stopWatchingFadeOutStatus.value = watch(
                [() => fadeOut.value.status],
                () => {
                  if (fadeOut.value.status === 'played') {
                    stopWatchingFadeOutStatus.value()
                    done()
                  }
                },
              )

              fadeOut.value.play(({ properties: { opacity: { interpolated: opacity } } }) => (element.style.opacity = `${opacity}`))
            },
            cancel ({ element }) {
              stopWatchingFadeOutStatus.value()
              fadeOut.value.stop()
              element.style.opacity = '1'
            },
          },
        }
      }
    );

    (window as unknown as WithGlobals).testState =  { toggle }

    return { stub, isShown, toggle }
  }
})
</script>
