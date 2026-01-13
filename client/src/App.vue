<script setup>
import { ref, onMounted, watch } from 'vue'
import { useGoTo } from 'vuetify'
import AppHome from './components/AppHome.vue'
import AppFooter from './components/AppFooter.vue'
import {
  mdiArrowUpCircleOutline,
  mdiArrowDownCircleOutline,
  mdiWeatherNight,
  mdiWeatherSunny,
} from '@mdi/js'
import { useTheme } from 'vuetify'

const goTo = useGoTo()
const theme = useTheme()
let isDarkMode = ref(false)

onMounted(() => {
  const preferences = localStorage.getItem('preferences')
  if (preferences) {
    isDarkMode.value = JSON.parse(preferences).isDarkMode
  } else {
    localStorage.setItem('preferences', JSON.stringify({ isDarkMode: isDarkMode.value }))
  }
  theme.change(isDarkMode.value ? 'dark' : 'light')
})

watch(isDarkMode, (newVal) => {
  const preferences = localStorage.getItem('preferences')
  if (preferences) {
    const prefsObj = JSON.parse(preferences)
    prefsObj.isDarkMode = newVal
    localStorage.setItem('preferences', JSON.stringify(prefsObj))
  }
  theme.change(newVal ? 'dark' : 'light')
})
</script>

<template>
  <v-app style="background: rgba(0, 0, 0, 0.3)">
    <v-app-bar :elevation="10">
      <div style="margin-left: 20px">
        <p class="headline">WebGIS Silkroad</p>
      </div>
      <v-spacer></v-spacer>
      <v-btn
        variant="tonal"
        :append-icon="mdiArrowUpCircleOutline"
        rounded="xl"
        @click="goTo('#myMap')"
        >Map</v-btn
      >
      <v-btn
        variant="tonal"
        :prepend-icon="mdiArrowDownCircleOutline"
        rounded="xl"
        @click="goTo('#cities')"
        >Tables</v-btn
      >
      <v-spacer></v-spacer>
      <div style="margin-right: 20px; margin-top: 20px">
        <v-switch v-model="isDarkMode">
          <template v-slot:label>
            {{ isDarkMode ? 'Dark Mode' : 'Light Mode' }}
            <v-icon v-if="isDarkMode" color="yellow" :icon="mdiWeatherNight"></v-icon>
            <v-icon v-else color="yellow" :icon="mdiWeatherSunny"></v-icon>
          </template>
        </v-switch>
      </div>
    </v-app-bar>

    <v-main>
      <app-home v-bind:isDarkMode="isDarkMode" />
    </v-main>
    <app-footer v-bind:isDarkMode="isDarkMode" />
  </v-app>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  overflow: hidden;
  display: block;
  position: relative;
  width: 100%;
}
body {
  display: flex;
  flex-direction: column;
  background: url('https://images.unsplash.com/photo-1512036849132-48508f294900?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=688&q=80');
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
}
</style>
