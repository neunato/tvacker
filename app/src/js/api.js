import {TvMazeError} from "./error"
import {TvMazeOverloadError} from "./error"
import {TvMazeFetchError} from "./error"
import {logError} from "./error"
import db from "./db"


let api = {

   async show (id) {
      let show = await get("https://api.tvmaze.com/shows/" + id + "?embed=episodes")
      let {name, genres, premiered, type, language, runtime, status, image, externals, _embedded} = show
      let _episodes = _embedded.episodes
      let title = name
      if (type === "Animation")
         genres = [type, ...genres]
      let genre = genres.join(", ") || type
      let years = premiered ? (premiered.slice(0, 4) + "-") : "-"
      if (status === "Ended")
         years += _episodes[_episodes.length - 1].airdate.slice(0, 4)
      let imdb = externals.imdb
      let episodes = []
      let seasons = new Map()
      let last_episode = null
      let next_episode = null
      let now = new Date()
      for (let {season, number, airstamp} of _episodes) {
         let date = airstamp ? new Date(airstamp) : null
         let episode = {
            season,
            number,
            date
         }
         let season_episodes = seasons.get(season)
         if (!season_episodes)
            seasons.set(season, [episode])
         else
            season_episodes.push(episode)

         if (date < now && (!last_episode || date >= last_episode.date))
            last_episode = episode
         else if (!next_episode && (!date || date > now))
            next_episode = episode
      }
      image = {
         small: image ? image.medium : null,
         large: image ? image.original : null
      }

      return {
         id,
         title,
         years,
         genre,
         language,
         runtime,
         imdb,
         image,
         seasons,
         episodes,
         last_episode,
         next_episode
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
