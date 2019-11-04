import Vue from "vue"
import App from "./components/App.vue"
import ExpectedError from './error'
import api from "./api"
import store from "./store"
import db from "./db"

Vue.config.errorHandler = (error) => {
   let message
   if (error instanceof ExpectedError)
      message = error.message
   else
      message = "Something went wrong"
   store.dispatch("showMessage", {message})
}

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