<template>
   <email-form id="register" submit_label="Send email" @submit="register" :autocomplete="false"></email-form>
</template>


<script>
import EmailForm from "./email-form.vue"
import {handle_error} from "../error"

export default {
   methods: {
      async register ({email, password, reset}) {
         try {
            let store = this.$store
            await store.dispatch("register", {email, password})
            store.dispatch("show_message", {message:`Email sent to ${email}`})
            reset({email: "", password: ""})
         }
         catch (e) {
            handle_error(e)
         }
      }
   },

   components: {
      "email-form": EmailForm
   }
}
</script>
