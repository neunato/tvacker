<template>
   <div class="show-thumbnail" @click="openShow(show)">
      <img class="show-image" :src="show.data.image.small">
      <div class="show-details">
         <p class="title">{{show.data.title}}</p>
         <p class="years">{{show.data.years}}</p>
         <p class="genre">{{show.data.genre}}</p>
         <progress-ring v-if="tracked" :radius="40" :progress="progress" :stroke="4"></progress-ring>
         <div class="label" v-else><p>UNTRACKED</p></div>
      </div>
   </div>
</template>


<script>
import ProgressRing from "./progress-ring.vue"

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
         for (let i=1, n=seasons.length; i<=n; i++) {
            let count = seasons[i - 1]
            total += count
            if (i < seasonAt)
               watched += count
            else if (i === seasonAt)
               watched += episodeAt
         }
         return watched / total * 100
      }
   },

   methods: {
      openShow (show) {
         this.$store.commit("set", {show})
      }
   },

   components: {
      "progress-ring": ProgressRing
   }
}
</script>