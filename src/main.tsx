import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App';
import './index.css';

const ErrorFallback = () => (
  <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-100">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">حدث خطأ غير متوقع</h1>
      <button
        className="px-4 py-2 bg-blue-600 rounded text-white"
        onClick={() => window.location.reload()}
      >
        إعادة تحميل التطبيق
      </button>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
