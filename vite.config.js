import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      https: {
        key: fs.readFileSync(env.VITE_SSL_KEY || './dev-key.pem'),
        cert: fs.readFileSync(env.VITE_SSL_CERT || './dev-cert.pem'),
      },
      proxy: {
        '/api': {
          target: 'https://192.168.99.86:5000',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            icons: ['@heroicons/react'],
            charts: ['recharts'],
            utils: ['axios', 'react-hot-toast']
          }
        }
      }
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.(js|jsx|ts|tsx)$/,
      exclude: []
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
          '.jsx': 'jsx',
        },
      },
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    }
  }
})
