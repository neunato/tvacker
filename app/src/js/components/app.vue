<template>
   <div id="app">
      <main>
         <nav>
            <span @click="tab='tracked-shows'" :class="{selected: tab==='tracked-shows'}">Tracked</span>
            <span @click="tab='search-shows'"  :class="{selected: tab==='search-shows'}" >Search</span>
         </nav>
         <keep-alive>
            <component :is="tab"></component>
         </keep-alive>
      </main>
      <show-preview></show-preview>
   </div>
</template>


<script>
import data from "../data"
import ShowPreview from "./show-preview.vue"
import TrackedShows from "./tracked-shows.vue"
import SearchShows from "./search-shows.vue"

export default {
   data: () => data,
   components: {
      "show-preview": ShowPreview,
      "tracked-shows": TrackedShows,
      "search-shows": SearchShows,
   }
}
</script>