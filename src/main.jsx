import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import App from './App.jsx'

// Patch to prevent Firefox deprecation warning for MouseEvent.mozPressure by mapping it to standard PointerEvent.pressure
if (typeof window !== "undefined" && window.MouseEvent) {
  try {
    Object.defineProperty(window.MouseEvent.prototype, "mozPressure", {
      get() {
        return this.pressure !== undefined ? this.pressure : 0;
      },
      configurable: true,
      enumerable: true,
    });
  } catch (e) {
    console.warn("Could not patch MouseEvent.mozPressure:", e);
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
