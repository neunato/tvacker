<template>
   <section class="show-preview" @click="close_show">
      <div class="show" :class="{tracked}" @click.stop>
         <div class="show-details">
            <h1 class="show-title">{{show.data.title}}</h1>
            <img class="show-image" v-if="show.data.image.large" :src="show.data.image.large">
            <p class="show-info"><span class="show-years">{{show.data.years}}</span><span class="separator">●</span><span class="show-language">{{show.data.language}}</span><span class="separator">●</span><span class="show-genre">{{show.data.genre}}</span><span class="separator">●</span><span class="show-runtime">{{show.data.runtime}} min</span></p>
            <p class="imdb-link"><a target="_blank" :href="'https://www.imdb.com/title/' + show.data.imdb">More info at IMDB</a></p>
         </div>
         <div class="show-episodes">
            <table>
               <template v-for="{season, rows, table_width} in seasons_table">
                  <tr v-for="row, i in rows">
                     <th v-if="i===0" class="season label" :class="{watched: is_watched(show, season, 1), unreleased: !row[0].date || row[0].date > now}">{{season}}</th>
                     <th v-else class="season"></th>
                     <td v-for="{number, date} in row" class="episode" :class="{watched: is_watched(show, season, number), unreleased: !date || date > now}" @click="watch_episode(show, season, number, date)" :title="date ? date.toLocaleDateString('en-CA') : '???'"><span>{{number}}</span></td>
                  </tr>
               </template>
               <tr class="invisible"><td v-for="i in 11"></td></tr>
            </table>
         </div>
         <div class="track-button"><p @click="track_show(show)">{{tracked ? 'UN' : ''}}TRACK SHOW</p></div>
      </div>
   </section>
</template>


<script>
import {handle_error} from "../error"

export default {
   data: () => ({
      now: new Date()
   }),

   props: {
      show: Object
   },

   computed: {
      tracked () {
         let id = this.show.data.id
         let tracked = this.$store.state.shows
         return tracked.some(({data}) => data.id === id)
      },
      seasons_table () {
         let seasons = [...this.show.data.seasons]

         let table_width = Math.max(...seasons.map(([_, {length}]) => length))
         table_width = Math.max(10, table_width)
         table_width = Math.min(25, table_width)

         seasons = seasons.map(([season, episodes]) => {
            let rows = []
            let i = 0
            let n = episodes.length
            while (i < n) {
               rows.push(episodes.slice(i, i + table_width))
               i += table_width
            }
            return {season, rows, table_width}
         })

         return seasons
      }
   },

   methods: {
      close_show () {
         this.$store.dispatch("close_show")
      },

      track_show (show) {
         if (this.tracked)
            this.$store.dispatch("untrack_show", {show})
         else
            this.$store.dispatch("track_show", {show})
      },

      watch_episode (show, season, episode, date) {
         if (!this.tracked)
            return
         if (!date || date > this.now)
            return
         if (season === show.watched.season && episode === show.watched.episode)
            return
         this.$store.dispatch("watch_episode", {show, season, episode})
      },

      is_watched (show, season, episode) {
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
            this.close_show()
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

         this.close_show()
      })
   }
}
</script>
