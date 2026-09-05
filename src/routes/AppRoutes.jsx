import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Login from "../pages/Login"
import RecuperarPassword from "../pages/RecuperarPassword"
import Registro from "../pages/Registro"
import GestionUsuarios from "../pages/GestionUsuarios"
import Perfil from "../pages/Perfil"
import RegistroPaciente from "../pages/RegistroPaciente"
import HistorialPacientes from "../pages/HistorialPacientes"
import DetallePaciente from "../pages/DetallePaciente"
import IniciarEvaluacion from "../pages/IniciarEvaluacion"
import ConfigRecomendaciones from "../pages/ConfigRecomendaciones"

function RutaProtegida({ children }) {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" replace />
  return children
}

function RutaAdmin({ children }) {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" replace />
  if (usuario.rol !== "admin") return <Navigate to="/login" replace />
  return children
}

function RutaDoctor({ children }) {
  const { usuario } = useAuth()
  if (!usuario) return <Navigate to="/login" replace />
  if (usuario.rol !== "doctor") return <Navigate to="/login" replace />
  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-password" element={<RecuperarPassword />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/admin/usuarios" element={<RutaAdmin><GestionUsuarios /></RutaAdmin>} />
      <Route path="/doctor/pacientes/nuevo" element={<RutaDoctor><RegistroPaciente /></RutaDoctor>} />
      <Route path="/doctor/pacientes" element={<RutaDoctor><HistorialPacientes /></RutaDoctor>} />
      <Route path="/doctor/pacientes/:id" element={<RutaDoctor><DetallePaciente /></RutaDoctor>} />
      <Route path="/doctor/evaluacion" element={<RutaDoctor><IniciarEvaluacion /></RutaDoctor>} />
      <Route path="/doctor/recomendaciones" element={<RutaDoctor><ConfigRecomendaciones /></RutaDoctor>} />
      <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
    </Routes>
  )
}
