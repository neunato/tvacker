<template>
   <section id="tracked-shows">
      <show-list :shows="shows"></show-list>
      <p v-if="!shows.length" class="show-list-note">Nothing tracked yet</p>
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
            let intact1 = this.intact(a)
            let intact2 = this.intact(b)
            if (intact1 !== intact2)       // One is not started, and it goes last.
               return intact1 || -1
            if (watched1 || intact1)       // Both are entirely watched or not started at all, sort by title.
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
      },
      intact (show) {
         return show.watched.season === null && show.watched.episode === null
      },
      
   },

   components: {
      "show-list": ShowList
   }
}
</script>