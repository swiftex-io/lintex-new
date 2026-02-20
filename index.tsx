
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// AI Studio ponekad pokušava da učita skriptu više puta, 
// proveravamo da li je root već napravljen.
const root = (window as any)._quilexRoot || ReactDOM.createRoot(rootElement);
(window as any)._quilexRoot = root;

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
