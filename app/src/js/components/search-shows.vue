<template>
   <section id="search-shows">
      <input v-model="input" @input="" @keydown.enter="search(input)" ref="el" placeholder="Search">
      <show-list :shows="results"></show-list>
   </section>
</template>


<script>
import api from "../api"
import ShowList from "./show-list.vue"

export default {
   data: () => ({
      input: "",
      results: []
   }),

   methods: {
      async search (input) {
         this.results = await api.search(input)
      }
   },

   activated () {
      this.$refs.el.focus()
   },

   components: {
      "show-list": ShowList
   }
}
</script>