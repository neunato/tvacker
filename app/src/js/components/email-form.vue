<template>
   <section>
      <form>
         <input-field v-model="email" placeholder="Email" @enter="onEnter" :autocomplete="autoComplete" ref="email"></input-field>
         <input-field v-model="password" placeholder="Password" @enter="submit" :autocomplete="autoComplete" :hidden="true" ref="password"></input-field>
         <div class="submit" @click="submit"><p class="button">{{submitLabel}}</p></div>
      </form>
   </section>
</template>


<script>
import InputField from "./input-field.vue"
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

   computed: {
      emailEl () { return this.$refs.email.$refs.el },
      passwordEl () { return this.$refs.password.$refs.el }
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
            this.passwordEl.focus()
         else
            this.submit()
      }
   },

   activated () {
      if (this.email.trim() === "")
         this.emailEl.focus()
      else if (this.password.trim() === "")
         this.passwordEl.focus()
      else
         this.emailEl.focus()
   },

   components: {
      InputField
   }
}
</script>
