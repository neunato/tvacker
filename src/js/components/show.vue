<template>
   <div class="show" :class="{expanded}" @click="open_show">
      <a target="_blank" :href="`https://www.imdb.com/title/${show.data.imdb}`" rel="noopener">
         <img class="show-image" :src="show.data.image" v-tooltip="'More info at IMDB'">
      </a>
      <div class="show-details">
         <p class="title">{{show.data.title}}</p>
         <p class="years">{{show.data.years}}</p>
         <p class="genre">{{show.data.genre}}</p>
         <p class="language">{{show.data.language}}, {{show.data.runtime}} min</p>
         <div class="show-next-episode" v-if="tracked" @click.stop="watch_episode(show.watched.season, show.watched.episode)">
            <h1 v-tooltip="'Mark as watched'">
                <span>S</span>{{zero_pad(show.watched.season || 1)}}
                <span>E</span>{{zero_pad(show.watched.episode || 1)}}
            </h1>
         </div>
         <p v-else @click.stop="track_show">Track</p>
         <div class="show-tags">
            <span v-for="tag in show.tags">
               {{tag}}
            </span>
         </div>
      </div>
      <div class="show-progress" :style="{height: `${progress}%`, backgroundColor: progress_color(progress)}"></div>
      <div class="show-episodes" v-show="expanded">
         <table>
            <tbody>
               <template v-for="{season, rows} in seasons_table">
                  <tr v-for="row, i in rows">
                     <th v-if="i===0" class="season label" :class="{watched: is_watched(season, 1), unreleased: !row[0].date || row[0].date > now}">{{season}}</th>
                     <th v-else class="season"></th>
                     <td v-for="{number, date} in row" class="episode" :class="{watched: is_watched(season, number), unreleased: !date || date > now}" @click.stop="watch_episode(season, number)" v-tooltip="date ? date.toLocaleDateString('en-CA') : '???'"><span>{{number}}</span></td>
                  </tr>
               </template>
               <tr class="invisible"><td v-for="i in 11"></td></tr>
            </tbody>
         </table>
      </div>
      <div class="track-button"><p @click.stop="track_show">{{tracked ? 'UN' : ''}}TRACK SHOW</p></div>
   </div>
</template>

<script>
export default {
   data: () => ({
      expanded: false,
   }),

   props: {
      show: Object,
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
            return {season, rows}
         })

         return seasons
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
      open_show () {
         this.expanded = !this.expanded
      },

      track_show () {
         let store = this.$store
         let show = this.show
         if (this.tracked)
            store.dispatch("untrack_show", {show})
         else
            store.dispatch("track_show", {show})
      },

      watch_episode (season, episode) {
         let date = this.show.data.seasons.get(season - 1)?.[episode - 1]?.date
         if (!this.tracked)
            return
         if (!date || date > this.now)
            return
         if (season === this.show.watched.season && episode === this.show.watched.episode)
            return
         this.$store.dispatch("watch_episode", {show, season, episode})
      },

      is_watched (season, episode) {
         if (!this.tracked)
            return false
         let seasonAt = this.show.watched.season
         let episodeAt = this.show.watched.episode
         return season < seasonAt || (season===seasonAt && episode <= episodeAt)
      },

      progress_color (percent) {
         return `hsl(${(percent/100) * 120},30%,50%)`
      },

      zero_pad (text) {
         return String(text).padStart(2, "0")
      }
   }
}
</script>

<style>
.show-next-episode {
   position: absolute;
   right: 20px;
   top: 42px;
   transition: opacity 50ms ease;
}
.show-next-episode:active {
   opacity: 0.1;
}
.show-tags {
   position: absolute;
   top: 110px;
}
.show-tags span {
   border-radius: 50px;
   padding: 2px 4px;
   height: 15px;
   line-height: 15px;
   font-size: 10px;
   font-weight: bold;
   text-transform: uppercase;
   margin-right: 5px;
   background: #708AAD;
   color: #1B222C;
}

h1 {
   display: flex;
   height: 55px;
   font-size: 30px;
   padding: 5px 10px;
   border-radius: 5px;
   font-family: "Roboto Mono";
   font-weight: normal;
}
h1:hover {
   background: rgba(0,0,0,0.1)
}
h1 span {
   opacity: 0.7;
}
</style>
