<template>
   <section class="show-list">
      <template v-for="shows, group in show_groups">
         <template v-if="shows.length">
            <h2 v-if="groups_count>1" :class="{collapsed: hidden[group]}" @click="hidden[group] = !hidden[group]">{{group}}</h2>
            <ul>
               <li v-for="show in shows" :key="show.data.id">
                  <show-thumbnail :show="show"></show-thumbnail>
               </li>
            </ul>
         </template>
      </template>
   </section>
</template>


<script>
import ShowThumbnail from "./show-thumbnail.vue"

export default {
   data: () => ({
      hidden: {}
   }),

   props: {
      show_groups: Object
   },

   computed: {
      groups_count () {
         return Object.keys(this.show_groups).length
      }
   },

   created () {
      this.hidden = Object.keys(this.show_groups).reduce((r, c) => (r[c] = false, r), {})
   },

   components: {
      "show-thumbnail": ShowThumbnail
   }
}
</script>
