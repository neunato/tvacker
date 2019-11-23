<template>
   <email-form id="login" submitLabel="Enter" :onSubmit="login" :autoComplete="true"></email-form>
</template>


<script>
import EmailForm from "./email-form.vue"

export default {
   methods: {
      async login (email, password) {
         let store = this.$store
         await store.dispatch("login", {email, password})
      }
   },

   components: {
      "email-form": EmailForm
   }
}
</script>