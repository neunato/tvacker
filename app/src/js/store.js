import Vue from "vue"
import Vuex from "vuex"
import db from "./db"
import api from "./api"

Vue.use(Vuex)

let stamp = 0

let store = new Vuex.Store({
   state: {
      user: null,          // user email
      shows: [],           // tracked shows  - [{id: 0, watched: {season: 0, episode: 0}, timestamp: 0, data: {...}}]
      results: [],         // searched shows - [{id: 0, watched: {season: 0, episode: 0}, timestamp: 0, data: {...}}]
      input: "",
      show: null,          // open show      -  {id: 0, watched: {season: 0, episode: 0}, timestamp: 0, data: {...}}
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
         let shows = await db.fetch()

         // Retrieve tracked show data from tvmaze.
         shows = shows.map(async ({id, watched, timestamp}) => {
            let data = await api.show(id)
            return {
               watched,
               timestamp,
               data
            }
         })
         shows = await Promise.all(shows)

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
         commit("set", {loading: false, user: null, input: "", shows: [], results: [], show: null, suspended: false, message: null})
      },

      async track_show ({commit, state}, {show}) {
         let data = {
            id: show.data.id,
            timestamp: Date.now(),
            watched: {
               season: null,
               episode: null
            }
         }
         show.watched = data.watched
         show.timestamp = data.timestamp
         let shows = [...state.shows, show]
         commit("set", {shows})
         return db.push(data)
      },

      async untrack_show ({commit, state}, {show}) {
         let shows = state.shows.filter((s) => s !== show)
         commit("set", {shows})
         return db.delete(show.data.id)
      },

      async watch_episode ({commit, state}, {show, season, episode}) {
         let data = {
            id: show.data.id,
            timestamp: Date.now(),
            watched: {
               season,
               episode
            }
         }
         show.watched = data.watched
         show.timestamp = data.timestamp
         let shows = [...state.shows]
         commit("set", {shows})
         return db.push(data)
      },

      open_show ({commit}, {show}) {
         commit("set", {show})
      },

      close_show ({commit}) {
         commit("set", {show: null})
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
