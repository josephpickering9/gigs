<template>
  <div />
</template>

<script setup lang="ts">
import useMeta from '~/composables/useMeta'

const { updateMeta } = useMeta()
updateMeta({ title: 'Home', description: "Welcome to my gigs." })
</script>
