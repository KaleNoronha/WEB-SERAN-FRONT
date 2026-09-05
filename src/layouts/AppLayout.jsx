import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Users, ChevronLeft, ChevronRight, UserPlus, ClipboardList, PlayCircle, Settings } from "lucide-react"
import { SeranIcon } from "../components/SeranIcon"

const rolLabel = { admin: "Administrador", doctor: "Doctor" }

function getIniciales(nombre, apellido) {
  return `${nombre?.split(" ")[0]?.[0] ?? ""}${apellido?.split(" ")[0]?.[0] ?? ""}`.toUpperCase()
}

const navAdmin = [
  { label: "Gestión de usuarios", path: "/admin/usuarios", icon: Users },
  { label: "Recomendaciones", path: "/admin/recomendaciones", icon: Settings },
]

const navDoctor = [
  { label: "Registro de pacientes", path: "/doctor/pacientes/nuevo", icon: UserPlus },
  { label: "Historial de pacientes", path: "/doctor/pacientes", icon: ClipboardList },
  { label: "Iniciar evaluación", path: "/doctor/evaluacion", icon: PlayCircle },
  { label: "Recomendaciones", path: "/doctor/recomendaciones", icon: Settings },
]

export default function AppLayout({ children }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [colapsado, setColapsado] = useState(false)

  const nav = usuario?.rol === "admin" ? navAdmin : navDoctor

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${colapsado ? "w-16" : "w-56"} bg-slate-800 flex flex-col transition-all duration-300 shrink-0 relative`}>
        {/* Botón colapsar */}
        {colapsado ? (
          <button
            onClick={() => setColapsado(false)}
            className="absolute -right-4 top-3 w-8 h-8 bg-[#172033] rounded-full flex items-center justify-center text-white hover:text-slate-300 transition-colors z-10"
          >
            <ChevronRight size={14} strokeWidth={3} />
          </button>
        ) : (
          <button
            onClick={() => setColapsado(true)}
            className="absolute right-2 top-3 w-8 h-8 bg-[#172033] rounded-full flex items-center justify-center text-white hover:text-slate-300 transition-colors z-10"
          >
            <ChevronLeft size={14} strokeWidth={3} />
          </button>
        )}

        {/* Logo / Header */}
        <div className="h-14 flex items-center px-4 border-b border-slate-700 gap-3">
          <SeranIcon className={`text-white shrink-0 ${colapsado ? "mx-auto" : ""}`} style={{ fontSize: 20 }} />
          {!colapsado && <span className="text-base font-bold text-white truncate">SERAN</span>}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3 px-2 space-y-1">
          {nav.map(item => {
            const activo = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors ${activo ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-700 hover:text-white"} ${colapsado ? "justify-center" : ""}`}
                title={colapsado ? item.label : undefined}
              >
                <item.icon size={16} className="shrink-0" />
                {!colapsado && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-700 p-2">
          <button
            onClick={() => navigate("/perfil")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === "/perfil" ? "bg-slate-700" : "hover:bg-slate-700"} ${colapsado ? "justify-center" : ""}`}
            title={colapsado ? "Mi perfil" : undefined}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 bg-slate-600 text-white">
              {getIniciales(usuario?.nombre, usuario?.apellido)}
            </div>
            {!colapsado && (
              <div className="text-left min-w-0 flex-1">
                <p className="text-xs font-medium truncate text-white">{usuario?.nombre?.split(" ")[0]} {usuario?.apellido?.split(" ")[0]}</p>
                <p className="text-xs truncate text-slate-400">{rolLabel[usuario?.rol] ?? usuario?.rol}</p>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-y-auto flex flex-col">{children}</main>

    </div>
  )
}
