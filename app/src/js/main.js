import Vue from "vue"
import App from "./components/app.vue"
import api from "./api"
import store from "./store"
import db from "./db"
import {logError} from "./error"
import "./globals"

// A ridiculous behaviour disallows .errorHandler = f or even .errorHandler = (e) => f(e) without curly braces.
Vue.config.errorHandler = (error) => {logError(error)}

(async () => {
   try {
      let user = await db.init()
      if (user && user.emailVerified) {
         let email = user.email
         let local = true
         await store.dispatch("login", {email, local})
      }

      new Vue({
         el: "#app",
         store,
         render: (h) => h(App),
         components: {
            "app": App
         }
      })
   }
   catch (error) {
      let loader = document.querySelector("#preloader")
      loader.innerHTML = "Shit broke"
      loader.style.cursor = "initial"
      logError(error)
   }
})()
