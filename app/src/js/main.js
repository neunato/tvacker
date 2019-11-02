import Vue from "vue"
import App from "./components/App.vue"
import api from "./api"
import store from "./store"


new Vue({
   el: "#app",
   render: h => h(App),
   store,
   components: {
      App
   }
})


async function init () {
   let shows = [{
      id: 83,
      season: 31,
      episode: 8,
      time: 10
   },{
      id: 84,
      season: 18,
      episode: 5,
      time: 4
   },{
      id: 88,
      season: 4,
      episode: 14,
      time: 3
   }]
   shows = shows.map(({id, season, episode, time}) => api.show(id, true, season, episode, time))
   shows = await Promise.all(shows)
   store.commit("set", {tracked: shows})
}

init()