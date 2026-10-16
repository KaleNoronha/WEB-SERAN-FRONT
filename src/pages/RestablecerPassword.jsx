
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { SeranIcon } from "../components/SeranIcon"
import api from "../api/api"

export default function RestablecerPassword() {
  const { token } = useParams()

  const [password, setPassword] = useState("")
  const [confirmarPassword, setConfirmarPassword] = useState("")
  const [verPassword, setVerPassword] = useState(false)
  const [error, setError] = useState("")
  const [exito, setExito] = useState(false)
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    if (!password || !confirmarPassword) {
      setError("Completa ambos campos de contraseña")
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (password.length > 72) {
      setError("La contraseña debe tener como máximo 72 caracteres")
      return
    }

    if (new TextEncoder().encode(password).length > 72) {
      setError("La contraseña es demasiado larga")
      return
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    try {
      setCargando(true)

      await api.post("/api/auth/restablecer-password", {
        token,
        nueva_contrasena: password,
        confirmar_contrasena: confirmarPassword
      })

      setExito(true)
      setPassword("")
      setConfirmarPassword("")
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(
        typeof detail === "string"
          ? detail
          : "No fue posible restablecer la contraseña"
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-between p-16">
        <div />
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <SeranIcon className="text-white" style={{ fontSize: 44 }} />
            <h1 className="text-4xl font-bold text-white">SERAN</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Estimación automatizada de riesgo de anemia pediátrica en zonas rurales del Perú.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          © 2026 SERAN · Tesis · Universidad Peruana de Ciencias Aplicadas
        </p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Restablecer contraseña
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ingresa tu nueva contraseña para continuar utilizando SERAN.
            </p>
          </div>

          {exito ? (
            <div className="space-y-4">
              <p role="status" className="text-green-700 text-sm">
                Tu contraseña se actualizó correctamente.
              </p>
              <Link
                to="/login"
                className="block text-center w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg text-xs"
              >
                Ir al inicio de sesión
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    type={verPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu nueva contraseña"
                    autoComplete="new-password"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword(!verPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {verPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Confirmar nueva contraseña
                </label>
                <input
                  type={verPassword ? "text" : "password"}
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="Confirma tu contraseña"
                  autoComplete="new-password"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              {error && (
                <p role="alert" className="text-red-700 text-xs">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={cargando || !token}
                className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-xs"
              >
                {cargando ? "Actualizando..." : "Guardar nueva contraseña"}
              </button>

              <p className="text-center">
                <Link
                  to="/login"
                  className="text-xs text-slate-400 hover:text-slate-600 hover:underline"
                >
                  Volver al inicio de sesión
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
