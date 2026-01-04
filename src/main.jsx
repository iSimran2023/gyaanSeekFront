import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { Toaster } from 'react-hot-toast'; 

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <BrowserRouter>
      <App />
      <Toaster 
        position="top-center"
        gutter={12}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e1e1e',
            color: '#EEEBDD',
            border: '1px solid #630000',
            borderRadius: '8px',
            padding: '12px 16px',
            fontFamily: 'system-ui, sans-serif',
          },
          success: { iconTheme: { primary: '#810000', secondary: '#1e1e1e' } },
          error: { iconTheme: { primary: '#FF4C4C', secondary: '#1e1e1e' } },
        }}
      />
    </BrowserRouter>
  </AuthProvider>
);