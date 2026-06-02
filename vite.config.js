// vite.config.js
export default {
  build: {
    sourcemap: true,
    minify: false,
    terserOptions: {
      format: {
        beautify: true
      }
    },
  }
}