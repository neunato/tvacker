import Vue from 'vue'
import Vuex from 'vuex'
import db from './db'
import api from './api'

Vue.use(Vuex)

let store = new Vuex.Store({
   state: {
      user: null,          // user email
      shows: [],           // tracked shows - [{id: 0, watched: {season: 0, episode: 0}, timestamp: 0, data: {...}}]
      show: null,          // open show     -  {id: 0, watched: {season: 0, episode: 0}, timestamp: 0, data: {...}}
      loading: false
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

      async logout ({commit}) {
         commit("set", {loading: true})
         await db.logout()
         commit("set", {loading: false, user: null})
      },

      async trackShow ({commit, state}, {show}) {
         commit("set", {loading: true})
         let data = {
            id: show.data.id,
            timestamp: Date.now(),
            watched: show.watched,
         }
         await db.push(data)
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

      async watchEpisode ({commit}, {show, season, episode}) {
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
         commit("set", {loading: false})
      },

      openShow ({commit}, {show}) {
         commit("set", {show})
      },

      closeShow ({commit}) {
         commit("set", {show: null})
      }
   }
})

export default store