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
         let tracked = this.$store.state.shows
         let shows = await api.search(input)
         shows = shows.map((data) => tracked.find((show) => data.id === show.data.id) || {
            timestamp: null,
            watched: {
               season: null,
               episode: null
            },
            data
         })
         this.results = shows
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