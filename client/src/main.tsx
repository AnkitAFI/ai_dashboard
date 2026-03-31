import { hydrateRoot, createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from "react-router-dom";

const rootElement = document.getElementById("root")!;

if (rootElement.hasChildNodes()) {
  // React Snap pre-rendered HTML exists — hydrate it
  hydrateRoot(
    rootElement,
  <BrowserRouter>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </BrowserRouter>,
     {
      onRecoverableError: (error) => {
        if (process.env.NODE_ENV === 'production') return;
        console.error(error);
      }
    }
  );

} else {
  // No pre-render (first load or fallback) — normal render
  createRoot(rootElement).render(
  <BrowserRouter>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </BrowserRouter>
  );
}
