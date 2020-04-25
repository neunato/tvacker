<template>
   <section id="search-shows">
      <input-field v-model="input" placeholder="Search" @input="search(input, 200)" @enter="search(input)" :disabled="suspended" ref="input"></input-field>
      <p v-if="!searching && !results.length" class="show-list-note">{{input.trim() ? 'No results' : 'What are you watching?'}}</p>
      <show-list :shows="results"></show-list>
   </section>
</template>


<script>
import api from "../api"
import ShowList from "./show-list.vue"
import InputField from "./input-field.vue"
import {TvMazeOverloadError} from "../error"
import {handleError} from "../error"

export default {
   data: () => ({
      stamp: 0,
      searching: false
   }),

   computed: {
      results () { return this.$store.state.results },
      tracked () { return this.$store.state.shows },
      suspended () { return this.$store.state.suspended },
      input: {
         get () { return this.$store.state.input },
         set (input) { this.$store.dispatch("setInput", {input}) }
      }
   },

   methods: {
      async search (input, delay=0) {
         this.searching = true
         let store = this.$store

         this.stamp++
         let stamp = this.stamp

         if (delay)
            await sleep(delay)

         if (stamp !== this.stamp)
            return

         let shows
         try {
            shows = await api.search(input)
         }
         catch (error) {
            store.dispatch("setSearchResults", {results: []})

            if (!(error instanceof TvMazeOverloadError)) {
               handleError(error)
               return
            }

            store.dispatch("suspendShowAPI")
            store.dispatch("showMessage", {message: error.message, duration: Infinity})

            let retries = 3
            while (retries > 0) {
               try {
                  await sleep(5000)
                  shows = await api.search(input)
                  break
               }
               catch (e) {
                  retries--
               }
            }

            store.dispatch("unsuspendShowAPI")
            store.dispatch("hideMessage")

            if (!retries) {
               this.input = ""
               this.searching = false
               store.dispatch("showMessage", {message:"Fetching data failed"})
               return
            }
         }

         this.searching = false

         shows = shows.map((data) => this.tracked.find((show) => data.id === show.data.id) || {
            timestamp: null,
            watched: {
               season: null,
               episode: null
            },
            data
         })
         store.dispatch("setSearchResults", {results: shows})
      }
   },

   activated () {
      this.$refs.input.$refs.el.focus()
   },

   components: {
      "show-list": ShowList,
      "input-field": InputField,
   }
}
</script>
