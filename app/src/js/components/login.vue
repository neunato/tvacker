<template>
   <section id="login">
      <input type="text" v-model="email" @input="" @keydown.enter="" placeholder="Email" ref="email">
      <input type="password" v-model="password" @input="" @keydown.enter="" placeholder="Password" ref="password">
      <div class="submit-button" @click="user={email, password}; email=''; password=''"><p>Submit</p></div>
   </section>
</template>


<script>
import ShowList from "./show-list.vue"
import TrackedShows from "./tracked-shows.vue"

export default {
   data: () => ({
      email: "",
      password: ""
   }),

   computed: {
      user: {
         // get () { return this.$store.state.user },
         set (x) { this.$store.commit("set", {user: x, component: TrackedShows}) }
      }   
   },

   activated () {
      if (this.email.trim() === "")
         this.$refs.email.focus()
      else if (this.password.trim() === "")
         this.$refs.password.focus()
   }
}
</script>