import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Router provider (history API)
import App from './App.jsx';
import './index.css'; // globalni CSS (Tailwind i sl.)
import { LoadingProvider } from './contexts/LoadingContext.jsx'; // provider za globalni loading state
import { AuthProvider } from './contexts/AuthContext.jsx'; // provider za auth state

// Root mount React aplikacije u #root element
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* LoadingProvider obezbeđuje loading kontekst i withLoading helper */}
    <LoadingProvider>
      {/* AuthProvider čuva user state i metode login/register/logout */}
      <AuthProvider>
        {/* BrowserRouter omogućava navigaciju i <Routes> u App.jsx */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </LoadingProvider>
  </React.StrictMode>
);
