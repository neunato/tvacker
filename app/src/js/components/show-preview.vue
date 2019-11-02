<template>
   <section id="show-preview" v-if="show">
      <div class="close-button" ><img src="images/close.svg" @click="show=null"></div>
      <div class="show" :class="{tracked: show.tracked}">
         <img class="show-image" v-if="show.data.image.large" :src="show.data.image.large">
         <div class="show-details">
            <p class="title">{{show.data.title}}</p>
            <p class="years">{{show.data.years}}</p>
            <p class="genre">{{show.data.genre}}</p>
            <p class="label">{{show.data.label}}</p>
         </div>
         <div class="show-episodes">
            <table>
               <tr v-for="n, i in show.data.seasons">
                  <td class="season" :class="{watched: i+1 <= show.season}">{{i + 1}}</td>
                  <td v-for="j in n" class="episode" :class="{last: (i+1 == show.season && j == show.episode), watched: (i+1 < show.season || (i+1===show.season && j <= show.episode))}" @click="watch(show, i+1, j)">{{j}}</td>
               </tr>
               <tr class="invisible"><td v-for="i in 11"></td></tr>
            </table>
         </div>
         <div class="track-button" @click="track(show)">
            <p>{{show.tracked ? 'UNTRACK SHOW' : 'TRACK SHOW'}}</p>
         </div>
      </div>
   </section>
</template>


<script>
export default {
   computed: {
      show: {
         get () { return this.$store.state.show },
         set (x) { this.$store.commit("set", {show: x}) }
      },
      tracked: {
         get () { return this.$store.state.tracked },
         set (x) { this.$store.commit("set", {tracked: x}) }
      }
   },

   methods: {
      watch (show, season, episode) {
         if (!show.tracked)
            return
         show.season = season
         show.episode = episode
      },
      track (show) {
         if (show.tracked) {
            show.tracked = false
            show.season = null
            show.episode = null
            show.time = null
            this.tracked = this.tracked.filter((s) => s !== show)
         }
         else {
            show.tracked = true
            show.time = Date.now()
            this.tracked.push(show)
            // this.tracked = [...this.tracked, show]
         }
      }
   },

   mounted () {
      document.addEventListener("keydown", (e) => {
         if (e.key === "Escape" && this.show)
            this.show = null
      })
   }
}
</script>