import fs from 'fs'


function getInputs() {
  const files = fs.readdirSync('.')
  const inputs = {}

  files.forEach(file => {
    if (file.endsWith('.html')) {
      inputs[file.replace('.html', '')] = file
    }
  })

  return inputs
}

// vite.config.js
export default {
  build: {
    rollupOptions: {
      input: getInputs(),
    },
    sourcemap: true,
    minify: false,
    terserOptions: {
      format: {
        beautify: false
      }
    }
  }
}