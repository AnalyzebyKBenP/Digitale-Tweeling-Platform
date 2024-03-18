/** @type {import('tailwindcss').Config} */

/**
 * Install node.js -  https://nodejs.org/en
 * npm install -D tailwindcss
 * DEV: npx tailwindcss -i ./static/css/input.css -o ./static/css/output.min.css --watch 
 * LIVE: npx tailwindcss -i ./static/css/input.css -o ./static/css/output.min.css --minify
 *
 * Exclude blueprint templates by using exclamation mark when using local templates
 * for example: "!../shared/blueprints/base/templates/atlas.html"
*/

module.exports = {
  content: [
    '../shared/blueprints/atlas/templates/**/*.html',
    '../shared/blueprints/base/templates/**/*.html',
    '../shared/blueprints/marketplace/templates/**/*.html',
    '../shared/blueprints/mow/templates/**/*.html',
    '../shared/blueprints/atlas/static/js/**/*.js',
    '../shared/blueprints/base/static/js/**/*.js',
    '../shared/blueprints/marketplace/static/js/**/*.js',
    '../shared/blueprints/mow/static/js/**/*.js',
    '../shared/blueprints/mow/components/**/*.js',
    './templates/**/*.html',
  ],
  presets: [
    require('../shared/blueprints/base/static/tailwind/presets.js')
  ],
  theme: {
    extend: {
      // colors: {
      //   primary: {
      //     lighter: "#f00000",
      //     DEFAULT: "#f00000",
      //     dark: "#d60000"
      //   },
      //   gray: {
      //     DEFAULT: "#5e5e5e",
      //   }
      // },
    }
  },
}