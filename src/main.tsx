import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { StoreProvider } from './store';
import { ToastProvider } from './components/Toast';
// Mini stylesheets load in this order; globals.css must come last so the
// existing cascade wins until PR C migrates components. Do not reorder.
import '@mini-styles/tokens.css';
import '@mini-styles/axioms.css';
import '@mini-styles/primitives.css';
import '@mini-styles/archetypes.css';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </StoreProvider>
  </StrictMode>,
);
