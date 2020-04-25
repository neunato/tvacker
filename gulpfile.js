let rollup    = require("rollup")
let resolve   = require("rollup-plugin-node-resolve")
let commonjs  = require("rollup-plugin-commonjs")
let vue       = require("rollup-plugin-vue")
let replace   = require("rollup-plugin-replace")
let minify    = require("babel-minify")
let sass      = require("node-sass")


let t = {
   async rollup (contents, file) {
      let bundle = await rollup.rollup({ input: file.path, plugins: [
         replace({"process.env.NODE_ENV": "'develop'"}),
         vue(),
         resolve(),
         commonjs()
      ]})
      let { output } = await bundle.generate({ format: "iife" })
      let { code } = output[0]
      return code
   },

   minify (contents) {
      return minify(contents).code
   },

   sass (contents) {
      let result = sass.renderSync({
         data: contents.toString(),
         indentedSyntax: true,
         includePaths: ["app/src/sass/"]
      })
      return result.css
   }
}


let tasks = {
   "build:js": {
      watch: "app/src/js/",
      src: "app/src/js/main.js",
      dest: "app/dist/",
      transforms: [t.rollup, t.minify]
   },

   "build:css": {
      watch: "app/src/sass/",
      src: "app/src/sass/_entry.sass",
      rename: "main.css",
      dest: "app/dist/",
      transforms: [t.sass]
   },

   "build": {
      parallel: ["build:js", "build:css"]
   },

   "default": {
      series: ["build", "watch"]
   }
}

module.exports = require("glupost")(tasks, {beep: true})
