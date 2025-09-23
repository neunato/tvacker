<template>
   <section id="tracked-shows">
      <div class="filter-tags">
         <template v-for="{ active, count }, tag in tags">
            <span
               v-if="count"
               class="tag"
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
      },
      frozen_show_tags: {},
      unsubscribe: null
   }),
   computed: {
      shows() {
         let tag_list = Object.keys(this.tags)
         let shows = this.$store.state.shows
         shows = shows.toSorted((a, b) => {
            let tags_a = this.frozen_show_tags[a.id] || a.tags
            let tags_b = this.frozen_show_tags[b.id] || b.tags
            return tag_list.indexOf(tags_a[0]) - tag_list.indexOf(tags_b[0]) || a.data.title.localeCompare(b.data.title)
         })
         return shows
      },
      show_map() {
         let map = {}
         for (let show of this.shows) {
            map[show.id] = {
               tags_match: (show.tags || []).some((tag) => this.tags[tag].active),
               frozen_tags_match: (this.frozen_show_tags[show.id] || []).some((tag) => this.tags[tag].active)
            }
         }
         return map
      },
      filtered_shows() {
         return this.shows.filter(({ id }) => this.show_map[id].tags_match || this.show_map[id].frozen_tags_match)
      }
   },
   watch: {
      show_map(new_shows, old_shows = {}) {
         let ids = Object.keys(old_shows)
         for (let id of ids) {
            if (this.frozen_show_tags[id] && old_shows[id].frozen_tags_match && !new_shows[id]?.frozen_tags_match) {
               this.frozen_show_tags[id] = null
            }
         }
      },
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
               for (let tag of this.frozen_show_tags[show.id] || []) {
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
   mounted() {
      this.unsubscribe = this.$store.subscribeAction((action, state) => {
         if (action.type !== "watch_episode") {
            return
         }
         let show = action.payload.show
         this.frozen_show_tags[show.id] = this.frozen_show_tags[show.id] || JSON.parse(JSON.stringify(show.tags))
      })
   },
   beforeDestroy() {
      this.unsubscribe()
   },
   components: {
      "show-list": ShowList
   }
}
</script>
