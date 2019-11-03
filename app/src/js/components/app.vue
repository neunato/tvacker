<template>
   <div id="app" :class="{loading}">
      <main>
         <header>
            <div v-if="user" class="logout-button" @click="logout">log out</div>
            <nav>
               <span v-for="t in tabs" @click="tab=t" :class="{selected: t===tab}">{{t.label}}</span>
            </nav>
         </header>
         <keep-alive>
            <component :is="tab.component"></component>
         </keep-alive>
      </main>
      <show-preview v-if="show" :show="show"></show-preview>
   </div>
</template>


<script>
import ShowPreview from "./show-preview.vue"
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
      show () { return this.$store.state.show },
      shows () { return this.$store.state.shows },
      user () { return this.$store.state.user },
      loading () { return this.$store.state.loading }
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
      }
   },

   components: {
      "show-preview": ShowPreview,
      "tracked-shows": TrackedShows,
      "search-shows": SearchShows,
      "login": Login,
      "register": Register
   }
}
</script>