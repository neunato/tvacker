<template>
   <section class="show-list">
      <ul>
         <li v-for="show in shows" :key="show.data.id">
            <show-thumbnail :show="show"></show-thumbnail>
         </li>
      </ul>
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