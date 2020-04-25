<template>
   <div class="show-thumbnail" @click="openShow(show)">
      <img class="show-image" :src="show.data.image.small">
      <div class="show-details">
         <p class="title">{{show.data.title}}</p>
         <p class="years">{{show.data.years}}</p>
         <p class="genre">{{show.data.genre}}</p>
         <progress-ring v-if="tracked" :radius="32" :progress="progress" :stroke="4"></progress-ring>
         <text-ring v-else :radius="32" text="track" :clickHandler="() => trackShow(show)"></text-ring>
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
         let total = 0
         let watched = 0
         let seasonAt = show.watched.season
         let episodeAt = show.watched.episode
         let seasons = show.data.seasons
         for (let {season, length} of seasons) {
            total += length
            if (season < seasonAt)
               watched += length
            else if (season === seasonAt)
               watched += episodeAt
         }
         return watched / total * 100
      }
   },

   methods: {
      openShow (show) {
         this.$store.dispatch("openShow", {show})
      },

      async trackShow (show) {
         try {
            await this.$store.dispatch("trackShow", {show})
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