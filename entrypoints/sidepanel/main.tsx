import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/assets/main.css';
// import i18n initialization if any, will add later

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
