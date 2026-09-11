import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
      base: '/doleance/',
      server: {
        host: '0.0.0.0',
        port: 5173,
        // HTTPS/mkcert désactivé — retour à HTTP
        // https: {
        //   key: fs.readFileSync(env.VITE_SSL_KEY || './dev-key.pem'),
        //   cert: fs.readFileSync(env.VITE_SSL_CERT || './dev-cert.pem'),
      // },
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true
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
            charts: ['recharts'],
            utils: ['axios', 'react-hot-toast'],
            socket: ['socket.io-client']
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
