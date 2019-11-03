import Vue from "vue"
import App from "./components/App.vue"
import api from "./api"
import store from "./store"
import db from "./db"

(async () => {
   let user = await db.init()
   if (user)
      await store.dispatch("login", {email: user, local: true})

   new Vue({
      el: "#app",
      store,
      render: (h) => h(App),
      components: {
         "app": App
      }
   })
})()