<template>
   <section id="tracked-shows">
      <div class="filter-tags">
         <template v-for="{ active, count }, tag in tags">
            <span
               v-show="count"
               :class="{ active }"
               @click="toggle_tag(tag)"
            >
               {{tag}} ({{count}})
            </span>
         </template>
      </div>
      <p v-if="!filtered_shows.length" class="show-list-note">Nothing to show</p>
      <show-list v-else :shows="filtered_shows"></show-list>
   </section>
</template>


<script>
import ShowList from "./show-list.vue"

export default {
   data: () => ({
      tags: {
         "new episodes": {
            active: true,
            count: 0
         },
         "coming soon": {
            active: true,
            count: 0
         },
         "done": {
            active: false,
            count: 0
         },
         "not started": {
            active: false,
            count: 0
         }
      }
   }),
   computed: {
      shows() {
         return this.$store.state.shows
      },
      filtered_shows() {
         return this.shows.filter(({tags}) => tags.some((tag) => this.tags[tag].active))
      }
   },
   watch: {
      shows: {
         immediate: true,
         handler() {
            let keys = Object.keys(this.tags)
            for (let key of keys) {
               this.tags[key].count = 0
            }
            for (let show of this.shows) {
               for (let tag of show.tags) {
                  this.tags[tag].count++
               }
            }
         }
      }
   },
   methods: {
      toggle_tag(tag) {
         this.tags[tag].active = !this.tags[tag].active
      }
   },
   components: {
      "show-list": ShowList
   }
}
</script>
