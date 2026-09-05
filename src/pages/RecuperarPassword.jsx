import { useState } from "react"
import { usuarios } from "../data/mock"
import { SeranIcon } from "../components/SeranIcon"

export default function RecuperarPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [errorVisible, setErrorVisible] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [visible, setVisible] = useState(false)

  function mostrarError(msg) {
    setError(msg)
    setErrorVisible(false)
    setTimeout(() => setErrorVisible(true), 10)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!email) {
      mostrarError("Ingresa un correo electrónico.")
      return
    }
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!emailValido) {
      mostrarError("Ingrese un correo válido")
      return
    }
    const existe = usuarios.find(u => u.email === email)
    if (!existe) {
      mostrarError("El correo ingresado no está registrado")
      return
    }
    setError("")
    setErrorVisible(false)
    setEnviado(true)
    setTimeout(() => setVisible(true), 10)
  }

  function handleChange(e) {
    setEmail(e.target.value)
    setEnviado(false)
    setVisible(false)
    setError("")
    setErrorVisible(false)
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
            <h2 className="text-xl font-bold text-slate-800">Recuperar contraseña</h2>
            <p className="text-xs text-slate-500 mt-1">Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Correo electrónico</label>
              <input
                type="text"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={handleChange}
                autoComplete="off"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>

            {error && (
              <p className={`text-red-700 text-xs transition-opacity duration-500 ${errorVisible ? "opacity-100" : "opacity-0"}`}>
                {error}
              </p>
            )}

            {enviado && (
              <p className={`text-green-700 text-sm transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}>
                Enlace enviado exitosamente a <span className="font-medium">{email}</span>. Revisá tu bandeja de entrada.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg text-xs transition-colors"
            >
              Enviar enlace
            </button>

            <p className="text-center text-sm">
              <a href="/login" className="text-xs text-slate-400 hover:text-slate-600 hover:underline">Volver al inicio de sesión</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
