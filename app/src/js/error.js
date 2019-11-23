import store from "./store"
import db from "./db"


class FirebaseError extends Error {}

class TvMazeError extends Error {}

class TvMazeOverloadError extends Error {
   constructor () {
      super("Too many requests, take it easy")
   }
}

class TvMazeFetchError extends Error {
   constructor () {
      super("Fetching data failed")
   }
}

FirebaseError.prototype.name = "FirebaseError"
TvMazeError.prototype.name = "TvMazeError"
TvMazeOverloadError.prototype.name = "TvMazeOverloadError"
TvMazeFetchError.prototype.name = "TvMazeFetchError"


function handleError (error) {
   if (error instanceof FirebaseError || error instanceof TvMazeError)
      store.dispatch("showMessage", {message: error.message})
   else
      logError(error)
}

function logError (error) {
   let user = store.state.user || null
   let payload = {
      uid: user && user.uid,
      message: error.message,
      stack: error.stack,
      time: (new Date()).toUTCString()
   }
   db.pushError(payload)
}


export {
   FirebaseError,
   TvMazeError,
   TvMazeOverloadError,
   TvMazeFetchError,
   handleError,
   logError
}