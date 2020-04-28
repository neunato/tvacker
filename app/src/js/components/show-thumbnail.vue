<template>
   <div class="show-thumbnail" @click="open_show(show)">
      <img class="show-image" :src="show.data.image.small">
      <div class="show-details">
         <p class="title">{{show.data.title}}</p>
         <p class="years">{{show.data.years}}</p>
         <p class="genre">{{show.data.genre}}</p>
         <progress-ring v-if="tracked" :radius="32" :progress="progress" :stroke="4"></progress-ring>
         <text-ring v-else :radius="32" :stroke="4" text="track" @click="() => track_show(show)"></text-ring>
      </div>
   </div>
</template>


<script>
import ProgressRing from "./progress-ring.vue"
import TextRing from "./text-ring.vue"
import {handleError} from "../error"

export default {
   props: {
      show: Object,
   },

   computed: {
      tracked () {
         let id = this.show.data.id
         let tracked = this.$store.state.shows
         return tracked.some(({data}) => data.id === id)
      },

      progress () {
         let show = this.show
         let seasonAt = show.watched.season
         let episodeAt = show.watched.episode
         let last_episode = show.data.last_episode

         if (seasonAt === last_episode.season && episodeAt === last_episode.number)
            return 100

         let total = 0
         let watched = 0
         let now = new Date()
         let episodes = show.data.episodes
         let seasons = show.data.seasons
         seasons = [...seasons].filter(([_, [{date}]]) => date && date < now)

         for (let [season, {length}] of seasons) {
            total += length
            if (season < seasonAt)
               watched += length
            else if (season === seasonAt)
               watched += episodeAt
         }

         for (let i = episodes.length - 1; i >= 0; i--) {
            let date = episodes[i].date
            if (date > now)
               total--
            else
               break
         }
         return watched / total * 100
      }
   },

   methods: {
      open_show (show) {
         this.$store.dispatch("open_show", {show})
      },

      async track_show (show) {
         try {
            await this.$store.dispatch("track_show", {show})
         }
         catch (error) {
            handleError(error)
         }
      }

   },

   components: {
      "progress-ring": ProgressRing,
      "text-ring": TextRing
   }
}
</script>
