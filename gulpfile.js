
const rollup    = require("rollup")
const resolve   = require("rollup-plugin-node-resolve")
const commonjs  = require("rollup-plugin-commonjs")
const vue       = require("rollup-plugin-vue")
const replace   = require("rollup-plugin-replace")
const babel     = require("rollup-plugin-babel")
const minify    = require("babel-minify")
const less      = require("less")

const t = {
   minify (contents) {
      return minify(contents).code
   },

   async rollup (contents, file) {
      const bundle = await rollup.rollup({ input: file.path, plugins: [
         replace({"process.env.NODE_ENV": "'develop'"}),
         vue(),
         resolve(),
         commonjs(),
         //babel({presets: [["@babel/env", {targets: {ie: "11"}}]]}),
      ]})
      const { output } = await bundle.generate({ format: "iife" })
      const { code } = output[0]
      return code
   },

   async less (contents) {
      const generate = await less.render(contents.toString())
      const { css } = await generate
      return css
   }
}


const configuration = {
   tasks: {
      "build:js": {
         watch: "app/src/js/",
         src: "app/src/js/main.js",
         dest: "app/dist/",
         transforms: [t.rollup]//, t.minify]
      },

      "build:css": {
         watch: "app/src/less/",
         src: "app/src/less/main.less",
         rename: "main.css",
         dest: "app/dist/",
         transforms: [t.less]
      },

      "build": {
         parallel: ["build:js", "build:css"]
      },

      "default": {
         series: ["build", "watch"]
      }
   }
}

require("glupost")(configuration)