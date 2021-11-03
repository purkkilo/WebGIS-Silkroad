<template>
  <v-app
    style="
        background: rgba(0,0,0,0.3);"
  >
    <v-app-bar
      app
      v-bind:class="{
        'grey darken-4': isDarkMode,
        primary: !isDarkMode,
      }"
      dark
    >
      <div class="d-flex align-center">
        <p class="headline">WebGIS Silkroad</p>
      </div>
      <v-spacer></v-spacer>
      <v-btn
        rounded
        outlined
        text
        :dark="isDarkMode"
        @click="$vuetify.goTo('#myMap')"
        >Map<v-icon>mdi-arrow-up-circle-outline</v-icon></v-btn
      >
      <v-btn
        rounded
        outlined
        text
        :dark="isDarkMode"
        @click="$vuetify.goTo('#cities')"
        ><v-icon>mdi-arrow-down-circle-outline</v-icon>Tables</v-btn
      >
      <v-spacer></v-spacer>
      <div class="d-flex align-center">
        <v-switch v-model="isDarkMode">
          <template v-slot:label>
            {{ isDarkMode ? "Dark Mode" : "Light Mode" }}
            <v-icon v-if="isDarkMode" color="yellow">mdi-weather-night</v-icon>
            <v-icon v-else color="yellow">mdi-weather-sunny</v-icon>
          </template>
        </v-switch>
      </div>
    </v-app-bar>

    <v-main>
      <Home v-bind:isDarkMode="isDarkMode" />
    </v-main>
    <Footer v-bind:isDarkMode="isDarkMode" />
  </v-app>
</template>

<script>
import Home from "./components/Home";
import Footer from "./components/Footer";

export default {
  name: "App",

  components: {
    Home,
    Footer,
  },
  mounted() {
    const preferences = localStorage.getItem("preferences");
    if (preferences) {
      this.isDarkMode = JSON.parse(preferences).isDarkMode;
    } else {
      localStorage.setItem(
        "preferences",
        JSON.stringify({ isDarkMode: this.isDarkMode })
      );
    }
  },
  watch: {
    isDarkMode(val) {
      localStorage.setItem("preferences", JSON.stringify({ isDarkMode: val }));
    },
  },
  data: () => ({
    //
    isDarkMode: true,
  }),
};
</script>
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
  background: url("https://images.unsplash.com/photo-1512036849132-48508f294900?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=688&q=80");
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
}
</style>
