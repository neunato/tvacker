class ExpectedError extends Error {
   constructor (message, {silent, suspend}={}) {
      super(message)
      if (silent)
         this.silent = silent
      if (suspend)
         this.suspend = suspend
   }
}

ExpectedError.prototype.name = "ExpectedError"

export default ExpectedError