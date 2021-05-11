<template>
  <WithOptions openMenuKeycombo="shift+f11" deleteTabKeycombo="backspace" />
</template>

<script lang="ts">
import WithOptions from './withOptions.vue'

export default {
  components: {
    WithOptions,
  },
}
</script>
