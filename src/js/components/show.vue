<template>
   <div class="show" :class="{tracked}" @click="open_show" @mouseover="preload">
      <div class="show-image">
         <img :src="show.data.image">
         <a v-if="show.data.imdb" target="_blank" :href="`https://www.imdb.com/title/${show.data.imdb}`" rel="noopener" @click.stop>
            <div class="imdb">
               <svg xmlns="http://www.w3.org/2000/svg" width="64" height="32" viewBox="0 0 64 32" version="1.1"><g fill="#F5C518"><rect x="0" y="0" width="100%" height="100%" rx="4"></rect></g><g transform="translate(8.000000, 7.000000)" fill="#000000" fill-rule="nonzero"><polygon points="0 18 5 18 5 0 0 0"></polygon><path d="M15.6725178,0 L14.5534833,8.40846934 L13.8582008,3.83502426 C13.65661,2.37009263 13.4632474,1.09175121 13.278113,0 L7,0 L7,18 L11.2416347,18 L11.2580911,6.11380679 L13.0436094,18 L16.0633571,18 L17.7583653,5.8517865 L17.7707076,18 L22,18 L22,0 L15.6725178,0 Z"></path><path d="M24,18 L24,0 L31.8045586,0 C33.5693522,0 35,1.41994415 35,3.17660424 L35,14.8233958 C35,16.5777858 33.5716617,18 31.8045586,18 L24,18 Z M29.8322479,3.2395236 C29.6339219,3.13233348 29.2545158,3.08072342 28.7026524,3.08072342 L28.7026524,14.8914865 C29.4312846,14.8914865 29.8796736,14.7604764 30.0478195,14.4865461 C30.2159654,14.2165858 30.3021941,13.486105 30.3021941,12.2871637 L30.3021941,5.3078959 C30.3021941,4.49404499 30.272014,3.97397442 30.2159654,3.74371416 C30.1599168,3.5134539 30.0348852,3.34671372 29.8322479,3.2395236 Z"></path><path d="M44.4299079,4.50685823 L44.749518,4.50685823 C46.5447098,4.50685823 48,5.91267586 48,7.64486762 L48,14.8619906 C48,16.5950653 46.5451816,18 44.749518,18 L44.4299079,18 C43.3314617,18 42.3602746,17.4736618 41.7718697,16.6682739 L41.4838962,17.7687785 L37,17.7687785 L37,0 L41.7843263,0 L41.7843263,5.78053556 C42.4024982,5.01015739 43.3551514,4.50685823 44.4299079,4.50685823 Z M43.4055679,13.2842155 L43.4055679,9.01907814 C43.4055679,8.31433946 43.3603268,7.85185468 43.2660746,7.63896485 C43.1718224,7.42607505 42.7955881,7.2893916 42.5316822,7.2893916 C42.267776,7.2893916 41.8607934,7.40047379 41.7816216,7.58767002 L41.7816216,9.01907814 L41.7816216,13.4207851 L41.7816216,14.8074788 C41.8721037,15.0130276 42.2602358,15.1274059 42.5316822,15.1274059 C42.8031285,15.1274059 43.1982131,15.0166981 43.281155,14.8074788 C43.3640968,14.5982595 43.4055679,14.0880581 43.4055679,13.2842155 Z"></path></g></svg>
            </div>
         </a>
      </div>
      <div class="show-details">
         <p class="title">{{show.data.title}}</p>
         <p class="years">{{show.data.years}}</p>
         <p class="genre">{{show.data.genre}}</p>
         <p class="language">{{show.data.language}}, {{show.data.runtime}} min</p>
         <div class="show-next-episode" v-if="tracked" @click.stop="watch_next_episode" @click.right.stop.prevent="watch_prev_episode" :class="{ disabled: !show.watched.season || up_to_date }" v-tooltip="episode_tooltip(upcoming.date)">
            <span class="label">{{up_to_date ? 'last episode' : 'next episode'}}</span>
            <span>S</span>{{zero_pad(upcoming.season)}}
            <span>E</span>{{zero_pad(upcoming.episode)}}
         </div>
         <p v-else class="track-button" @click.stop="track_show">Track Show</p>
         <div class="show-tags">
            <span class="tag" v-for="tag in show.tags">
               {{tag}}
            </span>
         </div>
      </div>
      <div class="show-progress" :style="{backgroundColor: progress_color(progress, 0.3)}">
         <span :style="{height: `${progress}%`, backgroundColor: progress_color(progress)}"></span>
      </div>
      <div class="show-episodes" v-if="preloaded" v-show="expanded" :style="{gridTemplateColumns: `repeat(${table_width + 1}, 1fr)`}" @click.stop>
         <template v-for="({season, rows}) in seasons_table">
            <template v-for="row, i in rows">
               <span class="cell season label" v-if="i===0" :class="{watched: is_watched(season, 1), unreleased: !row[0].date || row[0].date > now}">S{{zero_pad(season)}}</span>
               <span class="cell season" v-else></span>
               <span class="cell episode" v-for="({number, date}) in row" :class="{watched: is_watched(season, number), unreleased: !date || date > now}" @click.stop="watch_episode(season, number)" v-tooltip="episode_tooltip(date)">{{number}}</span>
               <span class="cell " v-for="i in (table_width - row.length)"></span>
            </template>
         </template>
      </div>
      <div class="show-actions" v-if="expanded">
         <span class="track-button" @click.stop="track_show">{{tracked ? 'STOP TRACKING' : 'TRACK SHOW'}}</span>
      </div>
   </div>
</template>

<script>
export default {
   data: () => ({
      expanded: false,
      preloaded: false,
      now: new Date()
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

      up_to_date () {
         let watched = this.show.watched
         let last_episode = this.show.data.last_episode
         return watched.season === last_episode.season && watched.episode === last_episode.number
      },

      upcoming () {
         return this.next_episode(this.show.watched.season, this.show.watched.episode)
      },

      table_width () {
         let seasons = [...this.show.data.seasons]
         let table_width = Math.max(...seasons.map(([_, {length}]) => length))
         table_width = Math.max(10, table_width)
         table_width = Math.min(25, table_width)
         return table_width
      },

      seasons_table () {
         let seasons = [...this.show.data.seasons]
         seasons = seasons.map(([season, episodes]) => {
            let rows = []
            let i = 0
            let n = episodes.length
            while (i < n) {
               rows.push(episodes.slice(i, i + this.table_width))
               i += this.table_width
            }
            return {season, rows}
         })
         return seasons
      },

      progress () {
         let show = this.show
         let season_at = show.watched.season
         let episode_at = show.watched.episode
         let last_episode = show.data.last_episode

         if (season_at === last_episode.season && episode_at === last_episode.number)
            return 100

         let total = 0
         let watched = 0
         let episodes = show.data.episodes
         let seasons = show.data.seasons
         seasons = [...seasons].filter(([_, [{date}]]) => date && date < this.now)

         for (let [season, {length}] of seasons) {
            total += length
            if (season < season_at)
               watched += length
            else if (season === season_at)
               watched += episode_at
         }

         for (let i = episodes.length - 1; i >= 0; i--) {
            let date = episodes[i].date
            if (date > this.now)
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

      preload () {
         this.preloaded = true
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
         let show = this.show
         let date = show.data.seasons.get(season)?.[episode - 1]?.date
         if (!this.tracked)
            return
         if (date && date > this.now)
            return
         if (season === show.watched.season && episode === show.watched.episode)
            return
         this.$store.dispatch("watch_episode", {show, season, episode})
      },

      watch_next_episode () {
         this.watch_episode(this.upcoming.season, this.upcoming.episode)
      },

      watch_prev_episode () {
         let watched = this.show.watched
         let season
         let episode
         if (watched.season === 1 && watched.episode === 1) {
            season = null
            episode = null
         }
         else {
            let prev = this.prev_episode(watched.season, watched.episode)
            season = prev.season
            episode = prev.episode
         }
         this.watch_episode(season, episode)
      },

      next_episode (season, episode) {
         let show = this.show
         let last_episode = show.data.last_episode
         let seasons = show.data.seasons
         let date = last_episode.date

         if (season === last_episode.season && episode === last_episode.number) {
            return {
               season,
               episode,
               date
            }
         }

         let next = seasons.get(season)?.[episode]
         if (!next) {
            next = seasons.get(season + 1)?.[0]
         }
         season = next.season
         episode = next.number
         date = next.date

         return {
            season,
            episode,
            date
         }
      },

      prev_episode (season, episode) {
         let show = this.show
         let seasons = show.data.seasons

         if (season === 1 && episode === 1) {
            return {
               season,
               episode
            }
         }

         let prev
         if (episode === 1) {
            let episodes = seasons.get(season - 1)
            prev = episodes[episodes.length - 1]
         }
         else {
            prev = seasons.get(season)?.[episode - 2]
         }
         season = prev?.season || 1
         episode = prev?.number || 1

         return {
            season,
            episode
         }
      },

      is_watched (season, episode) {
         if (!this.tracked)
            return false
         let season_at = this.show.watched.season
         let episode_at = this.show.watched.episode
         return season < season_at || (season===season_at && episode <= episode_at)
      },

      episode_tooltip (date) {
         date = date ? date.toLocaleDateString("en-CA") : "???"
         return {
            content: `Release date<br>${date}`,
            html: true
         }
      },

      progress_color (percent, alpha = 1) {
         return `hsla(${(percent/100) * 120}, 30%, 50%, ${alpha})`
      },

      zero_pad (text) {
         return String(text).padStart(2, "0")
      }
   }
}
</script>
