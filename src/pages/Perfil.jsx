import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Pencil, LogOut } from "lucide-react"
import AppLayout from "../layouts/AppLayout"
import { useAuth } from "../context/AuthContext"

const rolLabel = { admin: "Administrador", doctor: "Doctor" }

function getIniciales(nombre, apellido) {
  return `${nombre?.split(" ")[0]?.[0] ?? ""}${apellido?.split(" ")[0]?.[0] ?? ""}`.toUpperCase()
}

export default function Perfil() {
  const navigate = useNavigate()
  const { usuario, logout } = useAuth()
  const [modalLogout, setModalLogout] = useState(false)
  const [editando, setEditando] = useState(false)

  const [nombre, setNombre] = useState(usuario?.nombre ?? "")
  const [apellido, setApellido] = useState(usuario?.apellido ?? "")
  const [colegiatura, setColegiatura] = useState(usuario?.colegiatura ?? "")
  const [nombreGuardado, setNombreGuardado] = useState(usuario?.nombre ?? "")
  const [apellidoGuardado, setApellidoGuardado] = useState(usuario?.apellido ?? "")
  const [colegiaturaGuardada, setColegiaturaGuardada] = useState(usuario?.colegiatura ?? "")
  const [errores, setErrores] = useState({})
  const [erroresVisibles, setErroresVisibles] = useState({})
  const [exito, setExito] = useState(false)
  const [exitoVisible, setExitoVisible] = useState(false)

  const esDoctor = usuario?.rol === "doctor"
  const modificado = nombre !== nombreGuardado || apellido !== apellidoGuardado || (esDoctor && colegiatura !== colegiaturaGuardada)
  const nombreUsuario = `${nombreGuardado.split(" ")[0]} ${apellidoGuardado.split(" ")[0]}`
  const soloLetras = /^[a-zA-záéíóúÁÉÍÓÚñÑüÜ\s]*$/

  function mostrarError(campo, msg) {
    setErrores(prev => ({ ...prev, [campo]: msg }))
    setErroresVisibles(prev => ({ ...prev, [campo]: false }))
    setTimeout(() => setErroresVisibles(prev => ({ ...prev, [campo]: true })), 10)
  }

  function limpiarError(campo) {
    setErrores(prev => ({ ...prev, [campo]: "" }))
    setErroresVisibles(prev => ({ ...prev, [campo]: false }))
  }

  function handleCancelar() {
    setNombre(nombreGuardado)
    setApellido(apellidoGuardado)
    setColegiatura(colegiaturaGuardada)
    setErrores({})
    setEditando(false)
  }

  function handleGuardar(e) {
    e.preventDefault()
    let valido = true
    if (!nombre.trim()) { mostrarError("nombre", "Ingresa tus nombres"); valido = false }
    else if (!soloLetras.test(nombre)) { mostrarError("nombre", "Solo se permiten letras"); valido = false }
    if (!apellido.trim()) { mostrarError("apellido", "Ingresa tus apellidos"); valido = false }
    else if (!soloLetras.test(apellido)) { mostrarError("apellido", "Solo se permiten letras"); valido = false }
    if (esDoctor) {
      if (!colegiatura.trim()) { mostrarError("colegiatura", "Ingresa tu número de colegiatura"); valido = false }
      else if (!/^CMP\d{4,6}$/.test(colegiatura)) { mostrarError("colegiatura", "Formato inválido. Ejemplo: CMP12345"); valido = false }
    }
    if (!valido) return
    setNombreGuardado(nombre)
    setApellidoGuardado(apellido)
    if (esDoctor) setColegiaturaGuardada(colegiatura)
    setEditando(false)
    setExito(true)
    setExitoVisible(false)
    setTimeout(() => setExitoVisible(true), 10)
    setTimeout(() => { setExito(false); setExitoVisible(false) }, 3000)
  }

  function ErrorCampo({ campo }) {
    if (!errores[campo]) return null
    return (
      <p className={`text-red-700 text-xs mt-1 transition-opacity duration-500 ${erroresVisibles[campo] ? "opacity-100" : "opacity-0"}`}>
        {errores[campo]}
      </p>
    )
  }

  return (
    <AppLayout>
      <div className="flex flex-col flex-1">
        <h1 className="text-base font-semibold text-slate-800 mb-4">Mi perfil</h1>

        {exito && (
          <p className={`text-xs px-3 py-2 mb-4 rounded-lg border bg-green-50 text-green-700 border-green-200 transition-opacity duration-500 ${exitoVisible ? "opacity-100" : "opacity-0"}`}>
            Cambios guardados exitosamente.
          </p>
        )}

        <div className="grid gap-6 pt-12 justify-center" style={{gridTemplateColumns: "18rem 24rem"}}>
          {/* Izquierda: tarjeta de perfil */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center gap-5" style={{alignSelf:"start"}}>
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-white text-2xl font-bold">
              {getIniciales(nombreGuardado, apellidoGuardado)}
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-semibold text-slate-800">{nombreUsuario}</p>
              <p className="text-xs text-slate-400">{rolLabel[usuario?.rol] ?? usuario?.rol}</p>
              <p className="text-xs text-slate-400">{usuario?.email}</p>
            </div>
            {!editando && (
              <button
                onClick={() => setEditando(true)}
                className="w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium py-2 rounded-lg transition-colors"
              >
                <Pencil size={12} /> Editar perfil
              </button>
            )}
            <button
              onClick={() => setModalLogout(true)}
              className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-medium py-2 rounded-lg transition-colors"
            >
              <LogOut size={12} /> Cerrar sesión
            </button>
          </div>

          {/* Derecha: información */}
          <div className="space-y-4">
            {/* Datos personales */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xs font-semibold text-slate-600 mb-4">Datos personales</h2>
              {editando ? (
                <form onSubmit={handleGuardar} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Nombres</label>
                      <input
                        type="text"
                        value={nombre}
                        onChange={e => { setNombre(e.target.value); limpiarError("nombre") }}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                      <ErrorCampo campo="nombre" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Apellidos</label>
                      <input
                        type="text"
                        value={apellido}
                        onChange={e => { setApellido(e.target.value); limpiarError("apellido") }}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                      <ErrorCampo campo="apellido" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Correo electrónico</label>
                    <p className="text-xs text-slate-400">{usuario?.email}</p>
                  </div>
                  {esDoctor && (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Número de colegiatura</label>
                      <input
                        type="text"
                        value={colegiatura}
                        onChange={e => { setColegiatura(e.target.value); limpiarError("colegiatura") }}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                      <ErrorCampo campo="colegiatura" />
                    </div>
                  )}
                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleCancelar}
                      className="text-xs text-slate-600 hover:text-slate-800 px-4 py-2"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!modificado}
                      className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Nombres</p>
                      <p className="text-xs text-slate-800 mt-0.5">{nombreGuardado}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Apellidos</p>
                      <p className="text-xs text-slate-800 mt-0.5">{apellidoGuardado}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Correo electrónico</p>
                    <p className="text-xs text-slate-800 mt-0.5">{usuario?.email}</p>
                  </div>
                  {esDoctor && (
                    <div>
                      <p className="text-xs text-slate-400">Número de colegiatura</p>
                      <p className="text-xs text-slate-800 mt-0.5">{colegiaturaGuardada}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Información del sistema */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-xs font-semibold text-slate-600 mb-4">Información del sistema</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Rol</p>
                  <p className="text-xs text-slate-800 mt-0.5">{rolLabel[usuario?.rol] ?? usuario?.rol}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Hospital</p>
                  <p className="text-xs text-slate-800 mt-0.5">{usuario?.hospital}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modalLogout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Cerrar sesión</h2>
            <p className="text-xs text-slate-600">¿Estás seguro que deseas cerrar sesión?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModalLogout(false)}
                className="text-xs text-slate-600 hover:text-slate-800 px-4 py-2"
              >
                Cancelar
              </button>
              <button
                onClick={() => { logout(); navigate("/login") }}
                className="bg-red-700 hover:bg-red-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
