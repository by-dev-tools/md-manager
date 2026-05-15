import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { StoreProvider } from './store';
import { ToastProvider } from './components/Toast';
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
