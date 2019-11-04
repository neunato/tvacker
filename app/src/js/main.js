import Vue from "vue"
import App from "./components/App.vue"
import ExpectedError from "./error"
import api from "./api"
import store from "./store"
import db from "./db"
import "./globals"

Vue.config.errorHandler = async (error) => {
   if (!(error instanceof ExpectedError)) {
      store.dispatch("showMessage", {message: "Something went wrong"})
      return
   }

   if (error.silent) {
      return
   }

   let message = error.message

   if (error.suspend) {
      store.commit("set", {suspended: true})
      await store.dispatch("showMessage", {message, duration: error.suspend})
      store.commit("set", {suspended: false})
   }
   else {
      store.dispatch("showMessage", {message})
   }
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