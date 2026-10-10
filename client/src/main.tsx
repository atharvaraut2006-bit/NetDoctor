import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DiagnosticProvider } from './context/DiagnosticContext';

// Import Clean Design System Styles in proper cascade order
import './styles/variables.css';
import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DiagnosticProvider>
      <App />
    </DiagnosticProvider>
  </React.StrictMode>
);
