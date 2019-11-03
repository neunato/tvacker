<template>
   <section id="show-preview">
      <div class="close-button" ><img src="images/close.svg" @click="closeShow"></div>
      <div class="show" :class="{tracked}">
         <img class="show-image" v-if="show.data.image.large" :src="show.data.image.large">
         <div class="show-details">
            <p class="title">{{show.data.title}}</p>
            <p class="years">{{show.data.years}}</p>
            <p class="genre">{{show.data.genre}}</p>
            <p class="label">{{show.data.label}}</p>
         </div>
         <div class="show-episodes">
            <table>
               <tr v-for="n, i in show.data.seasons">
                  <td class="season" :class="{watched: isWatched(show, i+1)}">{{i + 1}}</td>
                  <td v-for="_, j in n" class="episode" :class="{watched: isWatched(show, i+1, j+1)}" @click="watchEpisode(show, i+1, j+1)">{{j + 1}}</td>
               </tr>
               <tr class="invisible"><td v-for="i in 11"></td></tr>
            </table>
         </div>
         <div class="track-button" @click="toggleTracking(show)">
            <p>{{tracked ? 'UNTRACK SHOW' : 'TRACK SHOW'}}</p>
         </div>
      </div>
   </section>
</template>


<script>
export default {
   props: {
      show: Object
   },

   computed: {
      tracked () {
         let id = this.show.data.id
         let tracked = this.$store.state.shows
         return tracked.some(({data}) => data.id === id)
      }
   },

   methods: {
      closeShow () {
         this.$store.dispatch("closeShow")
      },

      toggleTracking (show) {
         if (this.tracked)
            this.$store.dispatch("untrackShow", {show})
         else
            this.$store.dispatch("trackShow", {show})
      },

      watchEpisode (show, season, episode) {
         if (this.tracked)
            this.$store.dispatch("watchEpisode", {show, season, episode})
      },

      isWatched (show, season, episode=null) {
         if (!this.tracked)
            return false
         let seasonAt = show.watched.season
         let episodeAt = show.watched.episode
         if (episode === null)
            return season <= seasonAt
         else
            return season < seasonAt || (season===seasonAt && episode <= episodeAt)
      }
   },

   mounted () {
      document.addEventListener("keydown", (e) => {
         if (e.key === "Escape" && this.show)
            this.closeShow()
      })
   }
}
</script>