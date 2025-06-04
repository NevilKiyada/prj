import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react'; // Add React import
import App from './App.jsx'
import './index.css'

// Add global error handler for debugging
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Add uncaught promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// More detailed debug utility
const debugReactRendering = () => {
  console.log('React rendering debugger installed');
  const originalCreateElement = React.createElement;
  React.createElement = function() {
    const element = originalCreateElement.apply(this, arguments);
    // Log component creations for key components
    if (arguments[0] && typeof arguments[0] !== 'string') {
      const componentName = arguments[0].name || arguments[0].displayName;
      if (componentName) {
        console.log(`Rendering component: ${componentName}`, {
          props: arguments[1]
        });
      }
    }
    return element;
  };
};

// Initialize debug utility
debugReactRendering();

const rootElement = document.getElementById('root');
console.log('Root element found:', rootElement);

const root = createRoot(rootElement);
console.log('React root created');

root.render(
  <StrictMode>
    <div className="debug-boundary">
      <App />
    </div>
  </StrictMode>,
);

console.log('Initial render triggered');
