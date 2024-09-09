import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/dbstudio/',
  plugins: [react()],
  build: {
    outDir: path.resolve('..', 'src', 'dbstudio', 'static'),
  },
})
