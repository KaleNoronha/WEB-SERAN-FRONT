import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

import { SeranIcon } from "../components/SeranIcon"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [verPassword, setVerPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [errorVisible, setErrorVisible] = useState(false)

  function mostrarError(msg) {
    setError(msg)
    setErrorVisible(false)
    setTimeout(() => setErrorVisible(true), 10)
  }

  async function handleSubmit(e) {
  e.preventDefault()

  if (!email && !password) {
    mostrarError("Credenciales incompletas")
    return
  }

  if (!email) {
    mostrarError("Credenciales incompletas")
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    mostrarError("Ingrese un correo válido")
    return
  }

  if (!password) {
    mostrarError("Credenciales incompletas")
    return
  }

  try {
    setError("")
    setErrorVisible(false)

    const usuario = await login(email, password)

    if (usuario.rol === "admin") {
      navigate("/admin/usuarios")
    } else {
      navigate("/doctor/pacientes")
    }

  } catch (error) {
    if (error.response?.status === 401) {
      mostrarError("Credenciales inválidas")
    } else if (error.response?.data?.detail) {
      mostrarError(error.response.data.detail)
    } else {
      mostrarError("No se pudo conectar con el servidor")
    }
  }
}

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-between p-16">
        <div />
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <SeranIcon className="text-white" style={{ fontSize: 44 }} />
            <h1 className="text-4xl font-bold text-white">SERAN</h1>
          </div>
          <p className="text-slate-400 text-sm">Estimación automatizada de riesgo de anemia pediátrica en zonas rurales del Perú.</p>
        </div>
        <p className="text-xs text-slate-500">© 2026 SERAN · Tesis · Universidad Peruana de Ciencias Aplicadas</p>
      </div>

      {/* Panel derecho */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">¡Bienvenido!</h2>
            <p className="text-xs text-slate-500 mt-1">Ingresá tus credenciales para continuar</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Correo electrónico</label>
              <input
                type="text"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={verPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setVerPassword(!verPassword)}
                  disabled={!password}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {verPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className={`text-red-700 text-xs transition-opacity duration-500 ${errorVisible ? "opacity-100" : "opacity-0"}`}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg text-xs transition-colors"
            >
              Iniciar sesión
            </button>

            <p className="text-center">
              <a href="/recuperar-password" className="text-xs text-slate-400 hover:text-slate-600 hover:underline">Olvidé mi contraseña</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
