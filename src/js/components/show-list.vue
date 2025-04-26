<template>
   <section class="show-list">
      <show-thumbnail v-for="show in shows" :show="show"></show-thumbnail>
   </section>
</template>

<script>
import ShowThumbnail from "./show-thumbnail.vue"

export default {
   props: {
      shows: Array
   },
   components: {
      "show-thumbnail": ShowThumbnail
   }
}
</script>
