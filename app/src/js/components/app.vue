<template>
   <div id="app">
      <main>
         <header>
            <div v-if="user" class="logout-button" @click="user=null">log out</div>
            <nav>
               <span v-for="{component: comp, label} in tabs" @click="component=comp" :class="{selected: component===comp}">{{label}}</span>
            </nav>
         </header>
         <keep-alive>
            <component :is="component"></component>
         </keep-alive>
      </main>
      <show-preview></show-preview>
   </div>
</template>


<script>
import ShowPreview from "./show-preview.vue"
import TrackedShows from "./tracked-shows.vue"
import SearchShows from "./search-shows.vue"
import Login from "./login.vue"
import Register from "./register.vue"

export default {
   computed: {
      user: {
         get () { return this.$store.state.user },
         set (x) { this.$store.commit("set", {user: x, component: Login}) }
      },

      component: {
         get () { return this.$store.state.component },
         set (x) { this.$store.commit("set", {component: x}) }
      },

      tabs () {
         if (this.user)
            return [
               {component: TrackedShows, label: "Tracked"},
               {component: SearchShows, label: "Search"}
            ]
         else
            return [
               {component: Login, label: "Log in"},
               {component: Register, label: "Sign up"}
            ]
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