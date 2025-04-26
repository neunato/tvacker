<template>
   <div id="app" :class="{loading, message, suspended}">
      <main>
         <header>
            <nav>
               <span v-for="t in tabs" class="tab" @click="tab=t" :class="{selected: t===tab}">{{t.label}}</span>
               <span v-if="user" class="logout" @click="logout">log out</span>
            </nav>
         </header>
         <keep-alive>
            <component :is="tab.component" :key="user + tab.component"></component>
         </keep-alive>
         <footer>Data by <a target="_blank" href="https://www.tvmaze.com/api" rel="noopener">TV Maze</a></footer>
      </main>

      <section id="overlay" @click="hide_message"><p v-if="message">{{message}}</p></section>
   </div>
</template>


<script>
import TrackedShows from "./tracked-shows.vue"
import SearchShows from "./search-shows.vue"
import Login from "./login.vue"
import Register from "./register.vue"

export default {
   data: () => ({
      tab: "",
      tabs: []
   }),

   computed: {
      shows () { return this.$store.state.shows },
      user () { return this.$store.state.user },
      loading () { return this.$store.state.loading },
      suspended () { return this.$store.state.suspended },
      message () { return this.$store.state.message }
   },

   watch: {
      user: {
         immediate: true,
         handler (user) {
            if (user) {
               this.tabs = [
                  {component: 'tracked-shows', label: "Tracked"},
                  {component: 'search-shows', label: "Search"}
               ]
               this.tab = this.tabs[Number(this.shows.length === 0)]
            }
            else {
               this.tabs = [
                  {component: 'login', label: "Log in"},
                  {component: 'register', label: "Sign up"}
               ]
               this.tab = this.tabs[0]
            }
         }
      }
   },

   methods: {
      logout () {
         this.$store.dispatch("logout")
      },

      hide_message () {
         if (this.message)
            this.$store.dispatch("hide_message")
      }
   },

   created () {
      let loader = document.querySelector("#preloader")
      loader.addEventListener("transitionend", (event) => {
         if (event.propertyName === "opacity")
            document.body.removeChild(loader)
      })
   },

   components: {
      "tracked-shows": TrackedShows,
      "search-shows": SearchShows,
      "login": Login,
      "register": Register
   }
}
</script>
