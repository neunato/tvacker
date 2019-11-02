<template>
   <section id="tracked-shows">
      <show-list :shows="sortedShows"></show-list>
   </section>
</template>


<script>
import ShowList from "./show-list.vue"

export default {
   computed: {
      tracked () {
         return this.$store.state.tracked
      },

      sortedShows () {
         let shows = [...this.tracked]
         shows.sort((a, b) => {
            let watched1 = this.completed(a)
            let watched2 = this.completed(b)
            if (watched1 !== watched2)     // One is entirely watched, and it goes last.
               return watched1 || -1
            if (watched1)                  // Both are entirely watched, sort by title.
               return a.data.title.localeCompare(b.data.title)
            else                           // Neither are entirely watched, sort by last edited.
               return b.time - a.time

         })
         return shows
      }
   },

   methods: {
      completed (show) {
         let seasons = show.data.seasons
         return show.season === seasons.length && show.episode === seasons[seasons.length - 1]
      }
   },

   components: {
      "show-list": ShowList
   }
}
</script>