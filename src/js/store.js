import { createStore } from "vuex"
import db from "./db"
import api from "./api"

let stamp = 0

function compute_tags(show) {
   let now = new Date()
   let ms_in_day = 1 * 24 * 60 * 60 * 1000
   let ms_in_month = 30 * 24 * 60 * 60 * 1000
   let {last_episode, next_episode} = show.data
   let ms_since_episode = now - last_episode.date
   let ms_until_episode = next_episode ? next_episode.date - now : -1
   let watched = show.watched
   let tags = []
   if (now - show.timestamp < ms_in_day)
      tags.push("recently added")
   if (ms_since_episode < ms_in_month && !(last_episode.season === watched.season && last_episode.number === watched.episode))
      tags.push("new episodes")
   if (ms_until_episode > 0 && ms_until_episode < ms_in_month)
      tags.push("coming soon")
   if (last_episode.season === watched.season && last_episode.number === watched.episode)
      tags.push("up to date")
   if (watched.season === null)
      tags.push("not started")
   else
      tags.push("watching")
   return tags
}

let store = createStore({
   state: {
      user: null,          // user email
      shows: [],           // tracked shows  - [{id: 0, watched: {season: 0, episode: 0}, timestamp: 0, data: {...}}]
      results: [],         // searched shows - [{id: 0, watched: {season: 0, episode: 0}, timestamp: 0, data: {...}}]
      input: "",
      loading: false,
      suspended: false,    // disables requests to tvmaze api
      message: null
   },

   mutations: {
      set (state, object) {
         let props = Object.keys(object)
         for (let prop of props)
            state[prop] = object[prop]
      }
   },

   actions: {
      async login ({commit}, {email, password=null, local=false}) {
         commit("set", {loading: true})

         // Login user to firebase.
         if (!local)
            await db.login(email, password)

         // Retrieve tracked shows from firebase.
         let tag_list = ["recently added", "new episodes", "coming soon", "watching", undefined, "up to date", "not started"]
         let shows = await db.fetch()

         // Retrieve tracked show data from tvmaze.
         shows = shows.map(async ({id, show_id, watched, timestamp}) => {
            let data = await api.show(show_id)
            let show = {
               id,
               watched,
               timestamp,
               data
            }
            show.tags = compute_tags(show)
            return show
         })
         shows = await Promise.all(shows)
         shows = shows.sort((a, b) => tag_list.indexOf(a.tags[0]) - tag_list.indexOf(b.tags[0]))

         commit("set", {loading: false, user: email, shows})
      },

      async register ({commit}, {email, password}) {
         commit("set", {loading: true})
         await db.register(email, password)
         commit("set", {loading: false})
      },

      async logout ({commit}) {
         commit("set", {loading: true})
         await db.logout()
         commit("set", {loading: false, user: null, input: "", shows: [], results: [], suspended: false, message: null})
      },

      async track_show ({commit, state}, {show}) {
         let data = {
            id: db.generateID(),
            show_id: show.data.id,
            uid: db.getUID(),
            timestamp: Date.now(),
            watched: {
               season: null,
               episode: null
            }
         }
         show.id = data.id
         show.watched = data.watched
         show.timestamp = data.timestamp
         show.tags = compute_tags(show)
         let shows = [...state.shows, show]
         commit("set", {shows})
         return db.push(data)
      },

      async untrack_show ({commit, state}, {show}) {
         let shows = state.shows.filter((s) => s !== show)
         commit("set", {shows})
         return db.delete(show.id)
      },

      async watch_episode ({commit, state}, {show, season, episode}) {
         let data = {
            id: show.id,
            show_id: show.data.id,
            uid: db.getUID(),
            timestamp: Date.now(),
            watched: {
               season,
               episode
            }
         }
         show.watched = data.watched
         show.timestamp = data.timestamp
         show.tags = compute_tags(show)
         let shows = [...state.shows]
         commit("set", {shows})
         return db.push(data)
      },

      set_search_results ({commit}, {results}) {
         commit("set", {results})
      },

      set_input ({commit}, {input}) {
         commit("set", {input})
      },

      suspend_show_api ({commit}) {
         commit("set", {suspended: true})
      },

      unsuspend_show_api ({commit}) {
         commit("set", {suspended: false})
      },

      async show_message ({commit}, {message, duration=2000}) {
         stamp++
         let id = stamp
         commit("set", {message, loading: false})
         if (duration === Infinity)
            return
         await sleep(duration)
         if (id === stamp)
            commit("set", {message: null})
      },

      hide_message ({commit}) {
         commit("set", {message: null})
      }
   }
})

export default store
