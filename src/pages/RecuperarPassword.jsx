
import { useState } from "react"
import { Link } from "react-router-dom"
import { SeranIcon } from "../components/SeranIcon"
import api from "../api/api"

export default function RecuperarPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setEnviado(false)

    const correo = email.trim()

    if (!correo) {
      setError("Ingresa tu correo electrónico")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError("Ingrese un correo válido")
      return
    }

    try {
      setCargando(true)

      await api.post("/api/auth/solicitar-recuperacion", {
        correo
      })

      setEnviado(true)
    } catch (err) {
      const detail = err.response?.data?.detail

      if (err.response?.status === 404) {
        setError("El correo ingresado no está registrado")
      } else if (typeof detail === "string") {
        setError(detail)
      } else {
        setError("No fue posible enviar el enlace. Inténtalo nuevamente.")
      }
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
              Recuperar contraseña
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="text"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError("")
                  setEnviado(false)
                }}
                autoComplete="email"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            {error && (
              <p role="alert" className="text-red-700 text-xs">
                {error}
              </p>
            )}

            {enviado && (
              <div role="status" className="text-green-700 text-xs">
                Enlace enviado exitosamente a{" "}
                <span className="font-medium">{email.trim()}</span>.
                Revisa tu bandeja de entrada y la carpeta de spam.
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-xs transition-colors"
            >
              {cargando ? "Enviando..." : "Enviar enlace"}
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
        </div>
      </div>
    </div>
  )
}
