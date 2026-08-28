import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import 'leaflet/dist/leaflet.css';
import './i18n'; // Important : doit être importé avant App

// Le basename suit automatiquement le "base" de Vite (vite.config.js => '/doleance/')
// => plus jamais de divergence entre le préfixe des assets et les routes du router.
const basename = import.meta.env.BASE_URL.replace(/\/+$/, '') || undefined;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter  basename={basename} future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);