<template>
   <section id="search-shows">
      <input v-model="input" @input="search(input, 200)" @keydown.enter="search(input)" ref="el" placeholder="Search">
      <show-list :shows="results"></show-list>
   </section>
</template>


<script>
import api from "../api"
import ShowList from "./show-list.vue"

export default {
   data: () => ({
      input: "",
      results: [],
      stamp: 0
   }),

   methods: {
      search (input, delay=0) {
         this.stamp++
         let stamp = this.stamp
         window.setTimeout(async () => {
            if (stamp !== this.stamp)
               return

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
         }, delay)
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