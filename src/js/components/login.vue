<template>
   <email-form id="login" submit_label="Enter" @submit="login" :autocomplete="true"></email-form>
</template>


<script>
import EmailForm from "./email-form.vue"
import {handle_error} from "../error"

export default {
   methods: {
      async login ({email, password, reset}) {
         try {
            let store = this.$store
            await store.dispatch("login", {email, password})
            reset({password: ""})
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
