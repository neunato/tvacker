import ExpectedError from "./error"
import store from "./store"

let api = {
   async show (id) {
      if (store.state.suspended)
         throw new ExpectedError("", {silent: true})

      let show = await this.get("https://api.tvmaze.com/shows/" + id + "?embed=episodes")
      let episodes = show._embedded.episodes

      let seasons = new Map()
      for (let {season, number} of episodes)
         seasons.set(season, number)
      seasons = [...seasons].map(([season, length]) => ({season, length}))

      let {name, genres, premiered, type, status, image} = show
      let title = name
      if (type === "Animation")
         genres = [type, ...genres]
      let genre = genres.join(", ") || type
      let years = premiered ? (premiered.slice(0, 4) + "-") : "-"
      if (status === "Ended")
         years += episodes[episodes.length - 1].airdate.slice(0, 4)
      image = {
         small: image ? image.medium : null,
         large: image ? image.original : null
      }

      return {
         id,
         title,
         genre,
         years,
         image,
         seasons
      }
   },

   async search (query) {
      if (store.state.suspended)
         throw new ExpectedError("", {silent: true})

      let shows = await this.get("https://api.tvmaze.com/search/shows?q=" + query)
      shows = shows.map(({show}) => show)
      shows = shows.filter(({weight, status}) => weight > 0 && ["Running", "Ended", "To Be Determined"].includes(status))
      shows = shows.sort(({score: a}, {score: b}) => b - a)
      shows = shows.map(({id}) => api.show(id))
      return Promise.all(shows)
   },

   async get (url) {
      let response = await fetch(url)
      if (response.status === 429)
         throw new ExpectedError("Too many requests, take it easy", {suspend: 5000})
      if (!response.ok)
         throw new Error("Request failed")
      let json = await response.json()
      return json
   }
}

export default api