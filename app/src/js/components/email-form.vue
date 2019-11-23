<template>
   <section>
      <input type="text" v-model="email" placeholder="Email" ref="email" @keydown.enter="onEnter" :autocomplete="autoComplete ? 'on' : 'new-password'">
      <input type="password" v-model="password" placeholder="Password" ref="password" @keydown.enter="submit" :autocomplete="autoComplete ? 'on' : 'new-password'">
      <div class="submit-button" @click="submit"><p>{{submitLabel}}</p></div>
   </section>
</template>


<script>
import {handleError} from "../error"

export default {
   data: () => ({
      email: "",
      password: ""
   }),

   props: {
      onSubmit: Function,
      submitLabel: String,
      autoComplete: Boolean
   },

   methods: {
      async submit () {
         try {
            await this.onSubmit(this.email, this.password)
            this.email = ""
            this.password = ""
         }
         catch (error) {
            handleError(error)
         }
      },

      onEnter () {
         if (this.password.trim() === "")
            this.$refs.password.focus()
         else
            this.submit()
      }
   },

   activated () {
      if (this.email.trim() === "")
         this.$refs.email.focus()
      else if (this.password.trim() === "")
         this.$refs.password.focus()
      else
         this.$refs.email.focus()
   }
}
</script>