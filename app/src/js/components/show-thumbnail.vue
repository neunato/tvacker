<template>
   <div class="show-thumbnail" @click="openShow(show)">
      <img class="show-image" :src="show.data.image.small">
      <div class="show-details">
         <p class="title">{{show.data.title}}</p>
         <p class="years">{{show.data.years}}</p>
         <p class="genre">{{show.data.genre}}</p>
         <progress-ring v-if="show.tracked" :radius="40" :progress="progress" :stroke="4"></progress-ring>
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
      progress () {
         let total = 0
         let watched = 0
         let seasonAt = this.show.season - 1
         let episodeAt = this.show.episode - 1
         let seasons = this.show.data.seasons
         for (let i=0, n=seasons.length; i<n; i++) {
            let count = seasons[i]
            total += count
            if (i < seasonAt)
               watched += count
            else if (i === seasonAt)
               watched += episodeAt + 1
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