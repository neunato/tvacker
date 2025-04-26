import store from "./store"
import db from "./db"


class FirebaseError extends Error {}

class TvMazeError extends Error {}

class TvMazeOverloadError extends TvMazeError {
   constructor () {
      super("Too many requests, take it easy")
   }
}

class TvMazeFetchError extends TvMazeError {
   constructor () {
      super("Fetching data failed")
   }
}

FirebaseError.prototype.name = "FirebaseError"
TvMazeError.prototype.name = "TvMazeError"
TvMazeOverloadError.prototype.name = "TvMazeOverloadError"
TvMazeFetchError.prototype.name = "TvMazeFetchError"


function handle_error (error) {
   if (error instanceof FirebaseError || error instanceof TvMazeError)
      store.dispatch("show_message", {message: error.message})
   else
      log_error(error)
}

function log_error (error) {
   if (import.meta.env.DEV) {
      console.error(error)
   }
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
   handle_error,
   log_error
}
