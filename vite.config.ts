import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    define: {
      // This makes the environment variable available to the client code
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    // This will copy the service-worker.js to the root of the dist folder
    publicDir: 'public',
  }
}
