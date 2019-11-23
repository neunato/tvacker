<template>
   <section id="login">
      <input type="text" v-model="email" @input="" @keydown.enter="" placeholder="Email" ref="email">
      <input type="password" v-model="password" @input="" @keydown.enter="" placeholder="Password" ref="password">
      <div class="submit-button" @click="login"><p>Enter</p></div>
   </section>
</template>


<script>
import {handleError} from "../error"

export default {
   data: () => ({
      email: "",
      password: ""
   }),

   methods: {
      async login () {
         try {
            let store = this.$store
            let payload = {
               email: this.email,
               password: this.password
            }
            await store.dispatch("login", payload)
            this.email = ""
            this.password = ""
         }
         catch (error) {
            handleError(error)
         }
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