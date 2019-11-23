<template>
   <section id="tracked-shows">
      <show-list :shows="shows"></show-list>
   </section>
</template>


<script>
import ShowList from "./show-list.vue"

export default {
   computed: {
      shows () {
         let shows = [...this.$store.state.shows]
         shows.sort((a, b) => {
            let watched1 = this.completed(a)
            let watched2 = this.completed(b)
            if (watched1 !== watched2)     // One is entirely watched, and it goes last.
               return watched1 || -1
            if (watched1)                  // Both are entirely watched, sort by title.
               return a.data.title.localeCompare(b.data.title)
            else                           // Neither are entirely watched, sort by last edited.
               return b.timestamp - a.timestamp

         })
         return shows
      }
   },

   methods: {
      completed (show) {
         let seasonAt = show.watched.season
         let episodeAt = show.watched.episode
         let seasons = show.data.seasons
         let {season, length} = seasons[seasons.length - 1]
         return seasonAt === season && episodeAt === length
      }
   },

   components: {
      "show-list": ShowList
   }
}
</script>