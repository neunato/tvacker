<template>
   <section id="login">
      <input v-model="email" @input="" @keydown.enter="" placeholder="Email" autofocus>
      <input v-model="password" @input="" @keydown.enter="" placeholder="Password">
      <div class="submit-button"><p>Send email</p></div>
   </section>
</template>


<script>
import ShowList from "./show-list.vue"

export default {
   data: () => ({
      email: "",
      password: ""
   })
}
</script>