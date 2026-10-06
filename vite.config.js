import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
      // Le build est servi à la racine du domaine par Apache.
      // BASE_URL vaut "/" -> BrowserRouter (main.jsx) utilise automatiquement
      // la racine comme basename, et tous les assets sont demandes en /assets/...
      base: env.VITE_BASE || '/',
      server: {
        host: '0.0.0.0', 
        port: 5173,
        origin: env.VITE_DEV_ORIGIN || undefined,
        hmr: env.VITE_HMR_DISABLED === '1' ? false : {
          host: env.VITE_HMR_HOST || undefined,
          protocol: env.VITE_HMR_PROTOCOL || undefined,
          clientPort: env.VITE_HMR_CLIENT_PORT ? parseInt(env.VITE_HMR_CLIENT_PORT, 10) : undefined,
        }, 
        allowedHosts: (env.VITE_ALLOWED_HOSTS || 'webapp.cua.mg,localhost,127.0.0.1').split(',').map(s => s.trim()).filter(Boolean),
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },

    preview: {
      host: '0.0.0.0',
      port: 4173,
      allowedHosts: (env.VITE_ALLOWED_HOSTS || 'webapp.cua.mg,localhost,127.0.0.1').split(',').map(s => s.trim()).filter(Boolean),
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
