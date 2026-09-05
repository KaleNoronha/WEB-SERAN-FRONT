import { BrowserRouter } from "react-router-dom"
import AppRoutes from "./routes/AppRoutes"
import { AuthProvider } from "./context/AuthContext"
import { PacientesProvider } from "./context/PacientesContext"
import { RecomendacionesProvider } from "./context/RecomendacionesContext"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PacientesProvider>
          <RecomendacionesProvider>
            <AppRoutes />
          </RecomendacionesProvider>
        </PacientesProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
