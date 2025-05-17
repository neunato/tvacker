<template>
   <section id="tracked-shows">
      <div class="filter-tags">
         <template v-for="{ active, count }, tag in tags">
            <span
               v-if="count"
               :class="{ active }"
               @click.exact="() => toggle_tag(tag, true)"
               @click.ctrl="() => toggle_tag(tag, false)"
               @click.shift="() => toggle_tag(tag, false)"
            >
               {{tag}}
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
         "recently added": {
            active: true,
            count: 0
         },
         "new episodes": {
            active: true,
            count: 0
         },
         "coming soon": {
            active: true,
            count: 0
         },
         "watching": {
            active: true,
            count: 0
         },
         "up to date": {
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
         return this.shows.filter(({tags}) => tags?.some((tag) => this.tags[tag].active))
      }
   },
   watch: {
      shows: {
         immediate: true,
         handler() {
            let tags = Object.values(this.tags)
            for (let tag of tags) {
               tag.count = 0
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
      toggle_tag(tag, exclusive) {
         if (!exclusive) {
            this.tags[tag].active = !this.tags[tag].active
            return
         }
         let tags = Object.values(this.tags)
         let active = this.tags[tag].active
         let count = tags.reduce((count, tag) => (count + Number(tag.active)), 0)
         for (let tag of tags) {
            tag.active = false
         }
         this.tags[tag].active = (!active || count !== 1)
      }
   },
   components: {
      "show-list": ShowList
   }
}
</script>
