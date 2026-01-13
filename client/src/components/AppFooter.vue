<script setup>
const links = ['Made for GIS course (Updated to Vue 3)']
</script>

<template>
  <v-footer>
    <v-row justify="center">
      <v-btn v-for="link in links" :key="link" variant="tonal" rounded class="my-2">
        {{ link }}
      </v-btn>
      <v-col class="py-4 text-center white--text" cols="12">
        {{ new Date().getFullYear() }} —
        <strong>Jori Kosonen</strong>
      </v-col>
    </v-row>
  </v-footer>
</template>

<style scoped></style>
