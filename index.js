import Vue from 'https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.esm.browser.js'

let db = {
   async tracked () {
      return [{
         id: 83,
         season: 31,
         episode: 8,
         time: 10
      },
      {
         id: 84,
         season: 18,
         episode: 5,
         time: 4
      },
      {
         id: 88,
         season: 4,
         episode: 14,
         time: 3
      }
      ]
   }
}

let api = {
   async show (id, tracked, seasonAt=0, episodeAt=0, time=0) {
      let cached = data.tracked.find(({data}) => data.id === id)
      if (cached)
         return cached

      let show = await this.get("http://api.tvmaze.com/shows/" + id + "?embed=episodes")
      let episodes = show._embedded.episodes
      let seasons = []
      for (let {season, number} of episodes)
         seasons[season - 1] = number

      let {name, genres, premiered, type, status, image} = show
      let title = name
      if (type === "Animation")
         genres = [type, ...genres]
      let genre = genres.join(", ") || type
      let years = premiered.slice(0, 4) + "-"
      if (status === "Ended")
         years += episodes[episodes.length - 1].airdate.slice(0, 4)
      image = {
         small: image ? image.medium : null,
         large: image ? image.original : null
      }

      return {
         season: seasonAt,
         episode: episodeAt,
         time,
         tracked,
         data: {
            id,
            title,
            genre,
            years,
            image,
            seasons
         }
      }
   },

   async search (query) {
      let shows = await this.get("http://api.tvmaze.com/search/shows?q=" + query)
      shows = shows.map(({show}) => show)
      shows = shows.filter(({weight, status}) => weight > 0 && ["Running", "Ended", "To Be Determined"].includes(status))
      shows = shows.sort(({score: a}, {score: b}) => b - a)
      shows = shows.map(({id}) => api.show(id, false))
      return Promise.all(shows)
   },

   async get (url) {
      let response = await fetch(url)
      let json = await response.json()
      return json
   }
}



Vue.component("progress-ring", {
   template: `
      <div class="progress-ring">
         <svg :width="radius * 2" :height="radius * 2">
            <circle
               stroke="#f5f5f5"
               fill="transparent"
               :stroke-width="stroke"
               :r="normalisedRadius"
               :cx="radius"
               :cy="radius"
            />
            <circle
               stroke="#c5c5c5"
               fill="transparent"
               :stroke-dasharray="circumference + ' ' + circumference"
               :style="{strokeDashoffset: strokeOffset}"
               :stroke-width="stroke"
               :r="normalisedRadius"
               :cx="radius"
               :cy="radius"
            />
         </svg>
         <p>{{Math.round(progress)}}%</p>
      </div>`,
   props: {
      radius: Number,
      progress: Number,
      stroke: Number
   },
   computed: {
      shortProgress () {
         return Math.round(this.progress * 100) / 100
      },
      normalisedRadius () {
         return this.radius - this.stroke * 2
      },
      circumference () {
         return this.normalisedRadius * 2 * Math.PI
      },
      strokeOffset () {
         return this.circumference - this.progress / 100 * this.circumference
      }
   }
})


Vue.component("show-list", {
   template: `
      <section class="show-list">
         <ul>
            <li v-for="show in shows" :key="show.data.id">
               <show-thumbnail :show="show"></show-thumbnail>
            </li>
         </ul>
      </section>`,
   props: {
      shows: Array
   }
})


Vue.component("show-thumbnail", {
   template: `
      <div class="show-thumbnail" @click="openShow(show)">
         <img class="show-image" :src="show.data.image.small">
         <div class="show-details">
            <p class="title">{{show.data.title}}</p>
            <p class="years">{{show.data.years}}</p>
            <p class="genre">{{show.data.genre}}</p>
            <progress-ring v-if="show.tracked" :radius="40" :progress="progress" :stroke="4"></progress-ring>
            <div class="label" v-else><p>UNTRACKED</p></div>
         </div>
      </div>`,

   props: {
      show: Object
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
      openShow
   }
})

Vue.component("show-preview", {
   template: `
      <section id="show-preview" v-if="show">
         <div class="close-button" ><img src="close.svg" @click="show=null"></div>
         <div class="show" :class="{tracked: show.tracked}">
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
                     <td class="season" :class="{watched: i+1 <= show.season}">{{i + 1}}</td>
                     <td v-for="j in n" class="episode" :class="{last: (i+1 == show.season && j == show.episode), watched: (i+1 < show.season || (i+1===show.season && j <= show.episode))}" @click="watch(show, i+1, j)">{{j}}</td>
                  </tr>
                  <tr class="invisible"><td v-for="i in 11"></td></tr>
               </table>
            </div>
            <div class="track-button" @click="track(show)">
               <p>{{show.tracked ? 'UNTRACK SHOW' : 'TRACK SHOW'}}</p>
            </div>
         </div>
      </section>`,

   methods: {
      watch (show, season, episode) {
         if (!show.tracked)
            return
         show.season = season
         show.episode = episode
      },
      track (show) {
         if (show.tracked) {
            show.tracked = false
            show.season = null
            show.episode = null
            show.time = null
            this.tracked = this.tracked.filter((s) => s !== show)
         }
         else {
            show.tracked = true
            show.time = Date.now()
            this.tracked.push(show)
         }
      }
   },

   mounted () {
      document.addEventListener("keydown", (e) => {
         if (e.key === "Escape" && this.show)
            this.show = null
      })
   },

   data: () => data
})



function openShow (show) {
   data.show = show
}

let data = {
   show: null,
   tab: "tracked-shows",
   input: "",
   results: [],
   tracked: []
}

Vue.component("tracked-shows", {
   template: `
      <section id="tracked-shows">
         <show-list :shows="sortedShows"></show-list>
      </section>`,
   data: () => data,

   computed: {
      sortedShows () {
         let shows = [...this.tracked]
         shows.sort((a, b) => {
            let watched1 = watched(a)
            let watched2 = watched(b)
            if (watched1 !== watched2)     // One is entirely watched, and it goes on behind.
               return watched1 || -1
            if (watched1)                  // Both are entirely watched, sort by title.
               return a.data.title.localeCompare(b.data.title)
            else                           // Neither are entirely watched, sort by last edited.
               return b.time - a.time

         })
         return shows
      }
   }
})

Vue.component("search-shows", {
   template: `
      <section id="tracked-shows">
         <input v-model="input" @input="" @keydown.enter="search(input)" ref="el" placeholder="Search">
         <show-list :shows="results"></show-list>
      </section>`,

   data: () => data,

   methods: {
      async search (input) {
         this.results = await api.search(input)
      }
   },

   activated () {
      this.$refs.el.focus()
   }
})

new Vue({
   el: "#app",
   template: `
      <div id="app">
         <main>
            <nav>
               <span @click="tab='tracked-shows'" :class="{selected: tab==='tracked-shows'}">Tracked</span>
               <span @click="tab='search-shows'"  :class="{selected: tab==='search-shows'}" >Search</span>
            </nav>
            <keep-alive>
               <component :is="tab"></component>
            </keep-alive>
         </main>
         <show-preview></show-preview>
      </div>
   `,

   data: () => data
})


async function init () {
   let shows = await db.tracked()
   shows = shows.map(({id, season, episode, time}) => api.show(id, true, season, episode, time))
   shows = await Promise.all(shows)
   data.tracked = shows
   // openShow(shows[0])
}

init()
////////////////////////////////////////////////////////////////////////

function print (args) {
   console.log(args)
}


function watched (show) {
   let seasons = show.data.seasons
   return show.season === seasons.length && show.episode === seasons[seasons.length - 1]
}