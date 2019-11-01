<template>
   <section id="tracked-shows">
      <input v-model="input" @input="" @keydown.enter="search(input)" ref="el" placeholder="Search">
      <show-list :shows="results"></show-list>
   </section>
</template>


<script>
import api from "../api"
import data from "../data"
import ShowList from "./show-list.vue"

export default {
   data: () => data,

   components: {
      "show-list": ShowList
   },

   methods: {
      async search (input) {
         this.results = await api.search(input)
      }
   },

   activated () {
      this.$refs.el.focus()
   }
}
</script>