import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.jsx"
import "./index.css"
import { AuthProvider } from "./context/AuthContext.jsx"
import { PacientesProvider } from "./context/PacientesContext.jsx"
import { RecomendacionesProvider } from "./context/RecomendacionesContext.jsx"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PacientesProvider>
          <RecomendacionesProvider>
            <App />
          </RecomendacionesProvider>
        </PacientesProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)