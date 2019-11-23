import {TvMazeError} from "./error"
import {TvMazeOverloadError} from "./error"
import {TvMazeFetchError} from "./error"
import {logError} from "./error"
import db from "./db"


let api = {

   async show (id) {
      let show = await get("https://api.tvmaze.com/shows/" + id + "?embed=episodes")
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
      let shows = await get("https://api.tvmaze.com/search/shows?q=" + query)
      shows = shows.map(({show}) => show)
      shows = shows.filter(({weight, status}) => weight > 0 && ["Running", "Ended", "To Be Determined"].includes(status))
      shows = shows.sort(({score: a}, {score: b}) => b - a)

      shows = shows.map(async ({id}) => {
         try {
            return await api.show(id)
         }
         catch (error) {
            if (error instanceof TvMazeOverloadError)
               throw error

            if (!(error instanceof TvMazeError)) {
               error.message = "Error parsing show " + id + ": " + error.message
               logError(error)
            }

            return null
         }
      })
      shows = await Promise.all(shows)
      shows = shows.filter((show) => show !== null)

      return Promise.all(shows)
   }

}


async function get (url) {
   let response = await fetch(url)
   if (response.status === 429)
      throw new TvMazeOverloadError()
   if (!response.ok)
      throw new TvMazeFetchError()
   let json = await response.json()
   return json
}


export default api