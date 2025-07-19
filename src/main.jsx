import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/loading.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Add fade-out class after app renders
window.addEventListener('load', () => {
  loadingElement?.classList.add('fade-out');
  // Remove the loading element after animation completes
  setTimeout(() => {
    loadingElement?.remove();
  }, 300);
});