import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// यह लाइन HTML से 'root' div को ढूंढती है।
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

// यह लाइन आपकी App को उस div के अंदर डालती है।
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

