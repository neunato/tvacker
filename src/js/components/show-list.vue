<template>
   <section class="show-list">
      <show v-for="show in shows" :show="show" :key="show.id"></show>
   </section>
</template>

<script>
import Show from "./show.vue"

export default {
   props: {
      shows: Array
   },
   components: {
      "show": Show
   }
}
</script>
