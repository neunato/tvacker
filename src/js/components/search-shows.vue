<template>
   <section id="search-shows">
      <input-field v-model="input" placeholder="Search" @input="search(input, 200)" @enter="search(input)" :disabled="suspended" ref="input"></input-field>
      <p v-if="note" class="show-list-note">{{note}}</p>
      <show-list :shows="results"></show-list>
   </section>
</template>

<script>
import api from "../api"
import ShowList from "./show-list.vue"
import InputField from "./input-field.vue"
import {TvMazeError, TvMazeOverloadError} from "../error"
import {handle_error} from "../error"

export default {
   data: () => ({
      stamp: 0,
      searching: false,
      error: null
   }),

   computed: {
      results () { return this.$store.state.results },
      tracked () { return this.$store.state.shows },
      suspended () { return this.$store.state.suspended },
      input: {
         get () { return this.$store.state.input },
         set (input) { this.$store.dispatch("set_input", {input}) }
      },
      note () {
         if (this.searching)
            return null
         if (this.error)
            return this.error
         if (this.input.trim() === "")
            return "What are you watching?"
         if (this.results.length)
            return null
         else
            return "No results"
      }
   },

   methods: {
      async search (input, delay=0) {
         this.searching = true
         this.error = null

         let store = this.$store

         this.stamp++
         let stamp = this.stamp

         if (delay)
            await sleep(delay)

         if (stamp !== this.stamp)
            return

         let shows = []
         try {
            shows = await api.search(input)
         }
         catch (error) {
            store.dispatch("set_search_results", {results: []})
            this.error = "Network error"

            if (!(error instanceof TvMazeError)) {
               handle_error(error)
               this.searching = false
               return
            }

            if (error instanceof TvMazeOverloadError) {
               store.dispatch("suspend_show_api")
               store.dispatch("show_message", {message: error.message, duration: Infinity})

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

               store.dispatch("unsuspend_show_api")
               store.dispatch("hide_message")

               if (!retries)
                  store.dispatch("show_message", {message: "Fetching data failed"})
            }
         }

         shows = shows.map((data) => this.tracked.find((show) => data.id === show.data.id) || {
            timestamp: null,
            watched: {
               season: null,
               episode: null
            },
            data
         })

         store.dispatch("set_search_results", {results: shows})
         this.searching = false
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
