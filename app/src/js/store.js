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
         commit("set", {loading: false, user: null, shows: [], results: [], show: null, suspended: false, message: null})
      },

      async trackShow ({commit, state}, {show}) {
         commit("set", {loading: true})
         let data = {
            id: show.data.id,
            timestamp: Date.now(),
            watched: {
               season: null,
               episode: null
            }
         }
         await db.push(data)
         show.watched = data.watched
         show.timestamp = data.timestamp
         let shows = [...state.shows, show]
         commit("set", {loading: false, shows})
      },

      async untrackShow ({commit, state}, {show}) {
         commit("set", {loading: true})
         await db.delete(show.data.id)
         let shows = state.shows.filter((s) => s !== show)
         commit("set", {loading: false, shows})
      },

      async watchEpisode ({commit, state}, {show, season, episode}) {
         commit("set", {loading: true})
         let data = {
            id: show.data.id,
            timestamp: Date.now(),
            watched: {
               season,
               episode
            }
         }
         await db.push(data)
         show.watched = data.watched
         show.timestamp = data.timestamp
         let shows = [...state.shows]
         commit("set", {loading: false, shows})
      },

      openShow ({commit}, {show}) {
         commit("set", {show})
      },

      closeShow ({commit}) {
         commit("set", {show: null})
      },

      setSearchResults ({commit}, {results}) {
         commit("set", {results})
      },

      suspendShowAPI ({commit}) {
         commit("set", {suspended: true})
      },

      unsuspendShowAPI ({commit}) {
         commit("set", {suspended: false})
      },

      async showMessage ({commit}, {message, duration=3000}) {
         stamp++
         let id = stamp
         commit("set", {message, loading: false})
         if (duration === Infinity)
            return
         await sleep(duration)
         if (id === stamp)
            commit("set", {message: null})
      },

      hideMessage ({commit}) {
         commit("set", {message: null})
      }
   }
})

export default store