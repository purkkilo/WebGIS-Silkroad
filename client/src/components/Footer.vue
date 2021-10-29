<template>
  <v-footer
    app
    paddless
    absolute
    v-bind:class="{
      'grey darken-4': isDarkMode,
      primary: !isDarkMode,
    }"
  >
    <v-row justify="center">
      <v-btn
        v-for="link in links"
        :key="link"
        color="white"
        text
        rounded
        class="my-2"
      >
        {{ link }}
      </v-btn>
      <v-col
        class="py-4 text-center white--text"
        cols="12"
        v-bind:class="{
          'grey darken-1': isDarkMode,
          'primary lighten-1': !isDarkMode,
        }"
      >
        {{ new Date().getFullYear() }} —
        <strong>Jori Kosonen</strong>
      </v-col>
    </v-row>
  </v-footer>
</template>

<script>
export default {
  name: "Footer",
  props: ["isDarkMode"],

  data() {
    return {
      links: ["Made for GIS course"],
    };
  },
  mounted() {},
  computed: {},
  methods: {},
};
</script>
<style scoped></style>
