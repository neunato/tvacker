<template>
   <section id="search-shows">
      <input v-model="input" @input="search(input, 200)" @keydown.enter="search(input)" ref="el" placeholder="Search" :disabled="suspended">
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

   computed: {
      suspended () { return this.$store.state.suspended }
   },

   methods: {
      async search (input, delay=0) {
         this.stamp++
         let stamp = this.stamp

         await sleep(delay)

         if (stamp !== this.stamp)
            return

         let tracked = this.$store.state.shows
         let shows

         try {
            shows = await api.search(input)
         }
         catch (e) {
            this.results = []
            if (e.suspend)
               setTimeout(() => { this.search(this.input) }, e.suspend)
            throw e
         }

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