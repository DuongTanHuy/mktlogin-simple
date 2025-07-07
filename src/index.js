import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { GoogleOAuthProvider } from '@react-oauth/google';
//
import { ErrorBoundary } from 'react-error-boundary';
import Page500 from 'src/sections/error/500-view';
import App from './App';

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_CLIENT_ID}>
    <HelmetProvider>
      <BrowserRouter>
        <Suspense>
          <ErrorBoundary fallback={<Page500 />}>
            <App />
          </ErrorBoundary>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  </GoogleOAuthProvider>
);
