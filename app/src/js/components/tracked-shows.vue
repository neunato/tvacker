<template>
   <section id="tracked-shows">
      <show-list :show_groups="show_groups"></show-list>
      <p v-if="!shows.length" class="show-list-note">Nothing tracked yet</p>
   </section>
</template>


<script>
import ShowList from "./show-list.vue"

export default {
   computed: {
      shows () {
         return this.$store.state.shows
      },
      show_groups () {
         let shows = {
            "new": [],
            "coming soon": [],
            "watching": [],
            "not started": [],
            "finished": []
         }

         let now = new Date()
         for (let show of this.shows) {
            let ms_in_month = 30 * 24 * 60 * 60 * 1000
            let {last_episode, next_episode} = show.data
            let ms_since_episode = now - last_episode.date
            let ms_until_episode = next_episode ? next_episode.date - now : -1
            let watched = show.watched
            let group
            if (ms_since_episode < ms_in_month && !(last_episode.season === watched.season && last_episode.number === watched.episode))
               group = "new"
            else if (ms_until_episode > 0 && ms_until_episode < ms_in_month)
               group = "coming soon"
            else if (last_episode.season === watched.season && last_episode.number === watched.episode)
               group = "finished"
            else if (watched.season !== null)
               group = "watching"
            else
               group = "not started"
            shows[group].push(show)
         }

         shows["new"].sort((a, b) => b.data.last_episode.date - a.data.last_episode.date || a.data.title.localeCompare(b.data.title))
         shows["coming soon"].sort((a, b) => (b.data.next_episode.date - now) - (a.data.next_episode.date - now) || a.data.title.localeCompare(b.data.title))
         shows["watching"].sort((a, b) => b.timestamp - a.timestamp || a.data.title.localeCompare(b.data.title))
         shows["finished"].sort((a, b) => a.data.title.localeCompare(b.data.title))
         shows["not started"].sort((a, b) => a.data.title.localeCompare(b.data.title))

         return shows
      }
   },

   components: {
      "show-list": ShowList
   }
}
</script>
