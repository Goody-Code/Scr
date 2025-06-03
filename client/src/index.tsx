import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import './i18n'; // Initialize i18next

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Use "Loading..." text key from translation files for Suspense fallback
// This requires i18n to be initialized enough to load this key,
// or a simple string if that's too complex for initial load.
// For simplicity here, a plain string "Loading..." will be used.
// A more advanced setup might use a tiny initial i18n instance for just this string.
root.render(
  <React.StrictMode>
    <Suspense fallback="Loading...">
      <App />
    </Suspense>
  </React.StrictMode>
);
