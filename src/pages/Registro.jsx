import { useEffect, useState } from "react"
import { Eye, EyeOff, ShieldCheck, Brain, MapPin, Cog } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { SeranIcon } from "../components/SeranIcon"
import api from "../api/api"

const requisitos = [
  { label: "Al menos 8 caracteres", test: v => v.length >= 8 },
  { label: "Una letra mayúscula", test: v => /[A-Z]/.test(v) },
  { label: "Una letra minúscula", test: v => /[a-z]/.test(v) },
  { label: "Un número", test: v => /[0-9]/.test(v) },
  { label: "Un carácter especial (#, @, etc.)", test: v => /[^A-Za-z0-9]/.test(v) },
]

export default function Registro() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [emailInvitado, setEmailInvitado] = useState("")
  const [validando, setValidando] = useState(true)

  const [verPassword, setVerPassword] = useState(false)
  const [verConfirmar, setVerConfirmar] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmar, setConfirmar] = useState("")
  const [errores, setErrores] = useState({})
  const [erroresVisibles, setErroresVisibles] = useState({})
  const [exito, setExito] = useState(false)
  const [enlaceUsado, setEnlaceUsado] = useState(false)

  useEffect(() => {
  validarInvitacion()
}, [])

async function validarInvitacion() {
  try {
    const response = await api.get(`/api/invitaciones/validar/${token}`)

    if (!response.data.valido) {
      setEnlaceUsado(true)
      return
    }

    setEmailInvitado(response.data.email)
  } catch (error) {
    setEnlaceUsado(true)
  } finally {
    setValidando(false)
  }
}

  function mostrarError(campo, msg) {
    setErrores(prev => ({ ...prev, [campo]: msg }))
    setErroresVisibles(prev => ({ ...prev, [campo]: false }))
    setTimeout(() => setErroresVisibles(prev => ({ ...prev, [campo]: true })), 10)
  }

  function limpiarError(campo) {
    setErrores(prev => ({ ...prev, [campo]: "" }))
    setErroresVisibles(prev => ({ ...prev, [campo]: false }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.target
    let valido = true

    const soloLetras = /^[a-zA-záéíóúÁÉÍÓÚñÑüÜ\s]+$/
    if (!form.nombres.value) { mostrarError("nombres", "Ingresa tus nombres"); valido = false }
    else if (!soloLetras.test(form.nombres.value)) { mostrarError("nombres", "Solo se permiten letras"); valido = false }
    if (!form.apellidos.value) { mostrarError("apellidos", "Ingresa tus apellidos"); valido = false }
    else if (!soloLetras.test(form.apellidos.value)) { mostrarError("apellidos", "Solo se permiten letras"); valido = false }
    if (!form.colegiatura.value) { mostrarError("colegiatura", "Ingresa tu número de colegiatura"); valido = false }
    else if (!/^CMP\d{4,6}$/.test(form.colegiatura.value)) { mostrarError("colegiatura", "Formato inválido. Ejemplo: CMP12345"); valido = false }
    if (!password) { mostrarError("password", "Ingresa una contraseña"); valido = false }
    else if (!requisitos.every(r => r.test(password))) { mostrarError("password", "La contraseña no cumple los requisitos"); valido = false }
    if (!confirmar) { mostrarError("confirmar", "Confirma tu contraseña"); valido = false }
    else if (password !== confirmar) { mostrarError("confirmar", "Las contraseñas no coinciden"); valido = false }

    if (!valido) return

try {
  await api.post(`/api/auth/registro-doctor/${token}`, {
    nombres: form.nombres.value,
    apellidos: form.apellidos.value,
    telefono: null,
    colegiatura: form.colegiatura.value,
    contrasena: password
  })

  setExito(true)
} catch (error) {
  if (error.response?.data?.detail) {
    mostrarError("general", error.response.data.detail)
  } else {
    mostrarError("general", "No se pudo completar el registro")
  }
}
}

const panelIzquierdo = (
    <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-col justify-between p-16">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <SeranIcon className="text-white" style={{ fontSize: 36 }} />
          <h1 className="text-3xl font-bold text-white">SERAN</h1>
        </div>
        <p className="text-slate-400 text-sm">Estimación automatizada de riesgo de anemia pediátrica</p>
      </div>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0">
            <Brain size={20} className="text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Sistema experto</p>
            <p className="text-xs text-slate-400 mt-0.5">Apoyo a la decisión clínica basada en conocimiento médico</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0">
            <Cog size={20} className="text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Motor de reglas clínicas</p>
            <p className="text-xs text-slate-400 mt-0.5">Evaluación basada en reglas condicionales</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0">
            <ShieldCheck size={20} className="text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Detección temprana</p>
            <p className="text-xs text-slate-400 mt-0.5">Identifica factores de riesgo en niños menores de 5 años</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center shrink-0">
            <MapPin size={20} className="text-slate-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Población vulnerable</p>
            <p className="text-xs text-slate-400 mt-0.5">Diseñado para zonas rurales del Perú</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-500">© 2026 SERAN · Tesis · Universidad Peruana de Ciencias Aplicadas</p>
    </div>
  )

if (validando) {
  return (
    <div className="min-h-screen flex">
      {panelIzquierdo}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <p className="text-sm text-slate-500">Validando invitación...</p>
      </div>
    </div>
  )
}
  
  if (enlaceUsado) {
    return (
      <div className="min-h-screen flex">
        {panelIzquierdo}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <span className="text-red-600 text-2xl">✕</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Enlace no válido</h2>
              <p className="text-xs text-slate-500 mt-1">Este enlace de invitación ha expirado o ya fue utilizado.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (exito) {
    return (
      <div className="min-h-screen flex">
        {panelIzquierdo}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Registro exitoso</h2>
              <p className="text-xs text-slate-500 mt-1">Tu cuenta ha sido creada correctamente.</p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg text-xs transition-colors"
            >
              Ir al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {panelIzquierdo}

      {/* Panel derecho */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Completar registro</h2>
            <p className="text-xs text-slate-500 mt-1">Configurá tu cuenta para acceder al sistema</p>
          </div>

          <form className="space-y-4" autoComplete="off" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Correo electrónico</label>
              <input
                type="email"
                value={emailInvitado}
                disabled
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nombres <span className="text-red-500">*</span></label>
                <input
                  name="nombres"
                  type="text"
                  placeholder="Ingresa tus nombres"
                  onChange={() => limpiarError("nombres")}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                {errores.nombres && (
                  <p className={`text-red-700 text-xs mt-1 transition-opacity duration-500 ${erroresVisibles.nombres ? "opacity-100" : "opacity-0"}`}>
                    {errores.nombres}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Apellidos <span className="text-red-500">*</span></label>
                <input
                  name="apellidos"
                  type="text"
                  placeholder="Ingresa tus apellidos"
                  onChange={() => limpiarError("apellidos")}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                {errores.apellidos && (
                  <p className={`text-red-700 text-xs mt-1 transition-opacity duration-500 ${erroresVisibles.apellidos ? "opacity-100" : "opacity-0"}`}>
                    {errores.apellidos}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Número de colegiatura médica <span className="text-red-500">*</span></label>
              <input
                name="colegiatura"
                type="text"
                placeholder="Ingresa tu número de colegiatura médica"
                onChange={() => limpiarError("colegiatura")}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
              {errores.colegiatura && (
                <p className={`text-red-700 text-xs mt-1 transition-opacity duration-500 ${erroresVisibles.colegiatura ? "opacity-100" : "opacity-0"}`}>
                  {errores.colegiatura}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contraseña <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={verPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={e => { setPassword(e.target.value); limpiarError("password") }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setVerPassword(!verPassword)}
                  disabled={!password}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {verPassword ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
              {errores.password && (
                <p className={`text-red-700 text-xs mt-1 transition-opacity duration-500 ${erroresVisibles.password ? "opacity-100" : "opacity-0"}`}>
                  {errores.password}
                </p>
              )}
              {password && (
                <ul className="mt-2 space-y-1">
                  {requisitos.map(r => (
                    <li key={r.label} className={`flex items-center gap-2 text-xs ${r.test(password) ? "text-green-700" : "text-slate-400"}`}>
                      <span>{r.test(password) ? "✓" : "○"}</span>
                      {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Confirmar contraseña <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={verConfirmar ? "text" : "password"}
                  placeholder="Confirma tu contraseña"
                  value={confirmar}
                  onChange={e => { setConfirmar(e.target.value); limpiarError("confirmar") }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setVerConfirmar(!verConfirmar)}
                  disabled={!confirmar}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {verConfirmar ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
              {errores.confirmar && (
                <p className={`text-red-700 text-xs mt-1 transition-opacity duration-500 ${erroresVisibles.confirmar ? "opacity-100" : "opacity-0"}`}>
                  {errores.confirmar}
                </p>
              )}
            </div>
              
          {errores.general && (
  <p className={`text-red-700 text-xs transition-opacity duration-500 ${erroresVisibles.general ? "opacity-100" : "opacity-0"}`}>
    {errores.general}
  </p>
)}

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg text-xs transition-colors"
            >
              Registrar
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}