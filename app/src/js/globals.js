window.print = console.log
window.sleep = function sleep(ms) {
   return new Promise((resolve) => setTimeout(resolve, ms))
}