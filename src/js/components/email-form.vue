<template>
   <section>
      <form>
         <input-field v-model="email" placeholder="Email" @enter="on_enter" :autocomplete="autocomplete" ref="email"></input-field>
         <input-field v-model="password" placeholder="Password" @enter="submit" :autocomplete="autocomplete" :hidden="true" ref="password"></input-field>
         <div class="submit" @click="submit"><p class="button">{{submit_label}}</p></div>
      </form>
   </section>
</template>


<script>
import InputField from "./input-field.vue"

export default {
   data: () => ({
      email: "",
      password: ""
   }),

   props: {
      submit_label: String,
      autocomplete: Boolean
   },

   computed: {
      email_el () { return this.$refs.email.$refs.el },
      password_el () { return this.$refs.password.$refs.el }
   },

   methods: {
      reset ({email, password}) {
         if (typeof email === "string")
            this.email = email
         if (typeof password === "string")
            this.password = password
      },

      submit () {
         let user = {
            email: this.email,
            password: this.password,
            reset: this.reset
         }
         this.$emit("submit", user)
      },

      on_enter () {
         if (this.password.trim() === "")
            this.password_el.focus()
         else
            this.submit()
      }
   },

   activated () {
      if (this.email.trim() === "")
         this.email_el.focus()
      else if (this.password.trim() === "")
         this.password_el.focus()
      else
         this.email_el.focus()
   },

   components: {
      InputField
   }
}
</script>
