<template>
   <section class="show-preview" @click="closeShow">
      <div class="show" :class="{tracked}" @click.stop>
         <div class="show-details">
            <h1 class="show-title">{{show.data.title}}</h1>
            <img class="show-image" v-if="show.data.image.large" :src="show.data.image.large">
            <p class="show-info"><span class="show-years">{{show.data.years}}</span><span class="separator">●</span><span class="show-language">{{show.data.language}}</span><span class="separator">●</span><span class="show-genre">{{show.data.genre}}</span><span class="separator">●</span><span class="show-runtime">{{show.data.runtime}} min</span></p>
            <p class="imdb-link"><a target="_blank" :href="'https://www.imdb.com/title/' + show.data.imdb">More info at IMDB</a></p>
         </div>
         <div class="show-episodes">
            <table>
               <template v-for="{season, length, rows, maxColumns} in seasons">
                  <tr v-for="row, i in rows">
                     <th v-if="i===0" class="season label" :class="{watched: isWatched(show, season, 1)}">{{season}}</th>
                     <th v-else class="season" :class="{watched: isWatched(show, season, i*maxColumns+1)}"></th>
                     <td v-for="episode in row" class="episode" :class="{watched: isWatched(show, season, episode)}" @click="watchEpisode(show, season, episode)">{{episode}}</td>
                  </tr>
               </template>
               <tr class="invisible"><td v-for="i in 11"></td></tr>
            </table>
         </div>
         <div class="track-button"><p @click="trackShow(show)">{{tracked ? 'UN' : ''}}TRACK SHOW</p></div>
      </div>
   </section>
</template>


<script>
import ProgressRing from "./progress-ring.vue"
import TextRing from "./text-ring.vue"
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
      },

      seasons () {
         let result = []
         let maxColumns = 10
         let max = 25
         for (let {season, length} of this.show.data.seasons) {
            let rows = []
            let n = Math.ceil(length / max)
            for (let i=0; i<n; i++) {
               let episodes = []
               let m
               if (i + 1 < n || length % max === 0)
                  m = max
               else
                  m = length % max
               for (let j=1; j<=m; j++)
                  episodes.push(i*max + j)

               if (episodes.length > maxColumns)
                  maxColumns = episodes.length
               rows.push(episodes)
            }
            result.push({
               season,
               length,
               rows,
            })
         }

         for (let data of result)
            data.maxColumns = maxColumns

         return result
      }
   },

   methods: {
      closeShow () {
         this.$store.dispatch("closeShow")
      },

      async trackShow (show) {
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

      isWatched (show, season, episode) {
         if (!this.tracked)
            return false
         let seasonAt = show.watched.season
         let episodeAt = show.watched.episode
         return season < seasonAt || (season===seasonAt && episode <= episodeAt)
      }
   },

   mounted () {
      document.addEventListener("keydown", (e) => {
         if (e.key === "Escape" && this.show)
            this.closeShow()
      })

      let min = 40
      let x1
      let x2
      let y1
      let y2

      document.addEventListener("touchstart", ({ touches: [{ clientX, clientY }]}) => {
         if (!this.show)
            return
         x1 = clientX
         y1 = clientY
      })

      // This should somehow be moved to touchend, which doesn't have .touches.
      document.addEventListener("touchmove", ({ touches: [{ clientX, clientY }]}) => {
         if (!this.show)
            return
         x2 = clientX
         y2 = clientY
      })

      document.addEventListener("touchend", () => {
         if (!this.show)
            return
         const x = Math.abs(x2 - x1)
         const y = Math.abs(y2 - y1)
         if (x < min)
            return
         if (x < y * 2)
            return
         if (x === 0)
            return

         this.closeShow()
      })
   },

   components: {
      "progress-ring": ProgressRing,
      "text-ring": TextRing
   }
}
</script>
