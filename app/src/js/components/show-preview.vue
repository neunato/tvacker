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
               <tr v-for="{season, length} in show.data.seasons">
                  <td class="season" :class="{watched: isWatched(show, season)}">{{season}}</td>
                  <td v-for="_, i in length" class="episode" :class="{watched: isWatched(show, season, i+1)}" @click="watchEpisode(show, season, i+1)">{{i + 1}}</td>
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
import {handleError} from "../error"

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

      async toggleTracking (show) {
         try {
            if (this.tracked)
               await this.$store.dispatch("untrackShow", {show})
            else
               await this.$store.dispatch("trackShow", {show})
         }
         catch (error) {
            handleError(error)
         }
      },

      async watchEpisode (show, season, episode) {
         try {
            if (!this.tracked)
               return
            if (season === show.watched.season && episode === show.watched.episode)
               return
            await this.$store.dispatch("watchEpisode", {show, season, episode})
         }
         catch (error) {
            handleError(error)
         }
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