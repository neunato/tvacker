import store from "./store"

let api = {
   async show (id, tracked, seasonAt=0, episodeAt=0, time=0) {
      let cached = store.state.tracked.find(({data}) => data.id === id)
      if (cached)
         return cached

      let show = await this.get("http://api.tvmaze.com/shows/" + id + "?embed=episodes")
      let episodes = show._embedded.episodes
      let seasons = []
      for (let {season, number} of episodes)
         seasons[season - 1] = number

      let {name, genres, premiered, type, status, image} = show
      let title = name
      if (type === "Animation")
         genres = [type, ...genres]
      let genre = genres.join(", ") || type
      let years = premiered.slice(0, 4) + "-"
      if (status === "Ended")
         years += episodes[episodes.length - 1].airdate.slice(0, 4)
      image = {
         small: image ? image.medium : null,
         large: image ? image.original : null
      }

      return {
         season: seasonAt,
         episode: episodeAt,
         time,
         tracked,
         data: {
            id,
            title,
            genre,
            years,
            image,
            seasons
         }
      }
   },

   async search (query) {
      let shows = await this.get("http://api.tvmaze.com/search/shows?q=" + query)
      shows = shows.map(({show}) => show)
      shows = shows.filter(({weight, status}) => weight > 0 && ["Running", "Ended", "To Be Determined"].includes(status))
      shows = shows.sort(({score: a}, {score: b}) => b - a)
      shows = shows.map(({id}) => api.show(id, false))
      return Promise.all(shows)
   },

   async get (url) {
      let response = await fetch(url)
      let json = await response.json()
      return json
   }
}

export default api