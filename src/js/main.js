import { createApp } from "vue"
import "./globals"
import store from "./store"
import db from "./db"
import {log_error} from "./error"
import App from "./components/app.vue"

try {
   let user = await db.init()
   if (user && user.emailVerified) {
      let email = user.email
      let local = true
      await store.dispatch("login", {email, local})
   }

   let element = document.querySelector("#app")
   let fragment = document.createDocumentFragment()
   let app = createApp(App)
   app.use(store)
   app.mount(fragment)
   element.parentNode.replaceChild(fragment, element)
   app.config.errorHandler = (error) => {log_error(error)}
}
catch (error) {
   let loader = document.querySelector("#preloader")
   loader.innerHTML = "Shit broke"
   loader.style.cursor = "initial"
   log_error(error)
}
