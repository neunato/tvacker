import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

let store = new Vuex.Store({
   state: {
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