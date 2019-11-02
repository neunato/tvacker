import Vue from 'vue'
import Vuex from 'vuex'
import Login from "./components/login.vue"

Vue.use(Vuex)

let store = new Vuex.Store({
   state: {
      component: Login,
      user: null,
      show: null,
      tracked: []
   },

   mutations: {
      set (state, object) {
         let props = Object.keys(object)
         for (let prop of props)
            state[prop] = object[prop]
      }
   }
})

export default store