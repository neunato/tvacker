<template>
   <email-form id="register" submitLabel="Send email" :onSubmit="register" :autoComplete="false"></email-form>
</template>


<script>
import EmailForm from "./email-form.vue"

export default {
   methods: {
      async register (email, password) {
         let store = this.$store
         await store.dispatch("register", {email, password})
         store.dispatch("showMessage", {message:`Email sent to ${email}`})
      }
   },

   components: {
      "email-form": EmailForm
   }
}
</script>