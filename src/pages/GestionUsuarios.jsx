import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, X, Eraser, SlidersHorizontal } from "lucide-react"
import AppLayout from "../layouts/AppLayout"
import api from "../api/api"

const estadoBadge = {
  activo: "bg-green-50 text-green-700",
  pendiente: "bg-amber-50 text-amber-700",
  inactivo: "bg-slate-100 text-slate-500",
}

function FiltroInput({ placeholder, value, onChange, opciones, className = "w-52" }) {
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState("")
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const ref = useRef(null)
  const portalRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        ref.current && !ref.current.contains(e.target) &&
        portalRef.current && !portalRef.current.contains(e.target)
      ) setAbierto(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleOpen() {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect()
      setPos({ top: r.bottom + 8, left: r.left, width: r.width })
    }
    setAbierto(true)
  }

  const opcionesUnicas = [...new Set(opciones)]
  const opcionesFiltradas = opcionesUnicas.filter(o => o.toLowerCase().includes(texto.toLowerCase()))

  function toggle(opcion) {
    onChange(prev => prev.includes(opcion) ? prev.filter(v => v !== opcion) : [...prev, opcion])
  }

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-slate-500">
        <input
          type="text"
          placeholder={value.length === 0 ? placeholder : `${value.length} seleccionado${value.length > 1 ? "s" : ""}`}
          value={texto}
          onChange={e => { setTexto(e.target.value); handleOpen() }}
          onFocus={handleOpen}
          className="flex-1 px-3 py-2 text-xs focus:outline-none"
        />
        {value.length > 0 && (
          <button type="button" onClick={e => { e.stopPropagation(); onChange([]) }} className="px-2 text-slate-400 hover:text-slate-600">
            <X size={12} />
          </button>
        )}
        <button type="button" onClick={() => abierto ? setAbierto(false) : handleOpen()} className="px-2 text-slate-400 hover:text-slate-600">
          <ChevronDown size={12} className={`transition-transform ${abierto ? "rotate-180" : ""}`} />
        </button>
      </div>
      {abierto && createPortal(
        <div
          ref={portalRef}
          className="fixed bg-white border border-slate-100 rounded-xl shadow-xl z-[9999] overflow-y-auto max-h-48"
          style={{ top: pos.top, left: pos.left, width: pos.width }}
        >
          {opcionesFiltradas.length === 0 ? (
            <p className="px-4 py-2.5 text-xs text-slate-400">Sin coincidencias</p>
          ) : (
            opcionesFiltradas.map(o => (
              <button
                key={o}
                onMouseDown={e => { e.preventDefault(); toggle(o) }}
                className="w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-slate-50 flex items-center gap-2"
              >
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${value.includes(o) ? "bg-slate-800 border-slate-800" : "border-slate-300"}`}>
                  {value.includes(o) && <span className="text-white text-xs">✓</span>}
                </span>
                <span className={`truncate ${value.includes(o) ? "text-slate-800 font-medium" : "text-slate-600"}`}>{o}</span>
              </button>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  )
}

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([])

  // Filtros aplicados (afectan la tabla)
  const [filtroNombre, setFiltroNombre] = useState([])
  const [filtroApellido, setFiltroApellido] = useState([])
  const [filtroCorreo, setFiltroCorreo] = useState([])
  const [filtrosEstado, setFiltrosEstado] = useState([])

  // Draft (solo viven en el drawer)
  const [draftNombre, setDraftNombre] = useState([])
  const [draftApellido, setDraftApellido] = useState([])
  const [draftCorreo, setDraftCorreo] = useState([])
  const [draftEstado, setDraftEstado] = useState([])

  const [panelFiltros, setPanelFiltros] = useState(false)

  const labelFiltro = { filtroNombre: "Nombre", filtroApellido: "Apellido", filtroCorreo: "Correo", filtrosEstado: "Estado" }
  const setFiltroMap = { filtroNombre: setFiltroNombre, filtroApellido: setFiltroApellido, filtroCorreo: setFiltroCorreo, filtrosEstado: setFiltrosEstado }
  const filtroEntradas = [ ["filtroNombre", filtroNombre], ["filtroApellido", filtroApellido], ["filtroCorreo", filtroCorreo], ["filtrosEstado", filtrosEstado] ]
  const totalFiltros = filtroEntradas.reduce((acc, [, v]) => acc + v.length, 0)

  const [modalInvitar, setModalInvitar] = useState(false)
  const [modalDesactivar, setModalDesactivar] = useState(null)
  const [modalReactivar, setModalReactivar] = useState(null)
  const [modalReenviar, setModalReenviar] = useState(null)
  const [emailInvitar, setEmailInvitar] = useState("")
  const [errorInvitar, setErrorInvitar] = useState("")
  const [errorInvitarVisible, setErrorInvitarVisible] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [mensajeVisible, setMensajeVisible] = useState(false)

  useEffect(() => {
  cargarUsuariosEInvitaciones()
}, [])

async function cargarUsuariosEInvitaciones() {
  try {
    const [doctoresResponse, invitacionesResponse] = await Promise.all([
      api.get("/api/usuarios/doctores"),
      api.get("/api/invitaciones/")
    ])

    const doctoresMapeados = doctoresResponse.data.map(doc => ({
      id: `doc-${doc.id}`,
      usuarioId: doc.id,
      nombre: doc.nombres,
      apellido: doc.apellidos,
      email: doc.correo,
      rol: "doctor",
      estado: doc.estado ? "activo" : "inactivo",
      fechaInvitacion: null,
      fechaRegistro: doc.fecha_registro
        ? new Date(doc.fecha_registro).toLocaleDateString("es-PE")
        : null
}))

    const correosDoctores = doctoresMapeados.map(doc => doc.email)

    const invitacionesPendientes = invitacionesResponse.data
      .filter(inv => !inv.used && !correosDoctores.includes(inv.email))
      .map(inv => ({
        id: `inv-${inv.id}`,
        nombre: "Pendiente",
        apellido: "Pendiente",
        email: inv.email,
        rol: "doctor",
        estado: "pendiente",
        fechaInvitacion: new Date(inv.created_at).toLocaleDateString("es-PE"),
        fechaRegistro: null
      }))

    setUsuarios([
      ...doctoresMapeados,
      ...invitacionesPendientes
    ])

  } catch (error) {
    mostrarMensaje("error", "No se pudieron cargar los usuarios.")
  }
}

  function abrirPanel() {
    setDraftNombre(filtroNombre); setDraftApellido(filtroApellido)
    setDraftCorreo(filtroCorreo); setDraftEstado(filtrosEstado)
    setPanelFiltros(true)
  }

  function aplicarFiltros() {
    setFiltroNombre(draftNombre); setFiltroApellido(draftApellido)
    setFiltroCorreo(draftCorreo); setFiltrosEstado(draftEstado)
    setPanelFiltros(false)
  }

  function limpiarDraft() {
    setDraftNombre([]); setDraftApellido([]); setDraftCorreo([]); setDraftEstado([])
  }

  function limpiarTodo() {
    setFiltroNombre([]); setFiltroApellido([]); setFiltroCorreo([]); setFiltrosEstado([])
  }

  const usuariosFiltrados = usuarios.filter(u => {
    return (
      (filtroNombre.length === 0 || filtroNombre.includes(u.nombre)) &&
      (filtroApellido.length === 0 || filtroApellido.includes(u.apellido)) &&
      (filtroCorreo.length === 0 || filtroCorreo.includes(u.email)) &&
      (filtrosEstado.length === 0 || filtrosEstado.includes(u.estado))
    )
  })

  function mostrarErrorInvitar(msg) {
    setErrorInvitar(msg)
    setErrorInvitarVisible(false)
    setTimeout(() => setErrorInvitarVisible(true), 10)
  }

  function mostrarMensaje(tipo, texto) {
    setMensaje({ tipo, texto })
    setMensajeVisible(false)
    setTimeout(() => setMensajeVisible(true), 10)
    setTimeout(() => { setMensaje(null); setMensajeVisible(false) }, 4000)
  }

  async function handleInvitar(e) {
  e.preventDefault()

  if (!emailInvitar) {
    mostrarErrorInvitar("Ingresa un correo electrónico.")
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInvitar)) {
    mostrarErrorInvitar("Ingrese un correo válido.")
    return
  }

  if (usuarios.find(u => u.email === emailInvitar)) {
    mostrarErrorInvitar("Este correo ya está habilitado en el sistema.")
    return
  }

  try {
    await api.post("/api/invitaciones/doctores", {
      email: emailInvitar
    })

  await cargarUsuariosEInvitaciones() 

    mostrarMensaje("ok", `Invitación enviada a ${emailInvitar}.`)
    setEmailInvitar("")
    setErrorInvitar("")
    limpiarTodo()
    setModalInvitar(false)

  } catch (error) {
    if (error.response?.status === 401) {
      mostrarErrorInvitar("Tu sesión expiró. Inicia sesión nuevamente.")
    } else if (error.response?.status === 403) {
      mostrarErrorInvitar("No tienes permisos para enviar invitaciones.")
    } else if (error.response?.data?.detail) {
      mostrarErrorInvitar(error.response.data.detail)
    } else {
      mostrarErrorInvitar("No se pudo enviar la invitación.")
    }
  }
}

  async function handleDesactivar() {
  try {
    await api.patch(`/api/usuarios/${modalDesactivar.usuarioId}/estado`, null, {
      params: {
        estado: false
      }
    })

    await cargarUsuariosEInvitaciones()

    mostrarMensaje("ok", `Doctor ${modalDesactivar.email} deshabilitado correctamente.`)
    setModalDesactivar(null)
  } catch (error) {
    mostrarMensaje("error", "No se pudo deshabilitar el usuario.")
  }
}

  async function handleReactivar() {
  try {
    await api.patch(`/api/usuarios/${modalReactivar.usuarioId}/estado`, null, {
      params: {
        estado: true
      }
    })

    await cargarUsuariosEInvitaciones()

    mostrarMensaje("ok", `Doctor ${modalReactivar.email} habilitado correctamente.`)
    setModalReactivar(null)
  } catch (error) {
    mostrarMensaje("error", "No se pudo habilitar el usuario.")
  }
}

  async function handleReenviar() {
    try {
      await api.post("/api/invitaciones/doctores/reenviar", {
        email: modalReenviar.email
      })

      await cargarUsuariosEInvitaciones()

      mostrarMensaje("ok", `Invitación reenviada a ${modalReenviar.email}.`)
      setModalReenviar(null)
    } catch (error) {
      if (error.response?.data?.detail) {
        mostrarMensaje("error", error.response.data.detail)
      } else {
        mostrarMensaje("error", "No se pudo reenviar la invitación.")
      }
    }
  }

  return (
    <AppLayout>
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-slate-800">Gestión de usuarios</h1>

        {mensaje && (
          <p className={`text-xs px-3 py-2 rounded-lg transition-opacity duration-500 ${mensajeVisible ? "opacity-100" : "opacity-0"} ${mensaje.tipo === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {mensaje.texto}
          </p>
        )}

        {/* Subheader: pills de filtros + acciones */}
        <div className="flex items-center gap-2 min-h-[36px]">
          <div className="flex-1 flex flex-wrap gap-1.5">
            {filtroEntradas.filter(([, vals]) => vals.length > 0).map(([key, vals]) => (
              <span key={key} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">
                <span className="text-slate-400">{labelFiltro[key]}:</span> {vals.join(", ")}
                <button onClick={() => setFiltroMap[key]([])} className="ml-0.5 text-slate-400 hover:text-slate-700">
                  <X size={10} />
                </button>
              </span>
            ))}

          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setModalInvitar(true)} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
              Invitar
            </button>
            <button
              onClick={abrirPanel}
              className={`flex items-center gap-1.5 border text-xs font-medium px-3 py-2 rounded-lg transition-colors ${totalFiltros > 0 ? "border-slate-800 bg-slate-800 text-white" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
            >
              <SlidersHorizontal size={12} />
              {totalFiltros > 0 && <span className="bg-white text-slate-800 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">{totalFiltros}</span>}
            </button>
          </div>
        </div>

        {/* Drawer de filtros */}
        {panelFiltros && (
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/30" onClick={() => setPanelFiltros(false)} />
            <div className="fixed top-0 right-0 bottom-0 w-[380px] bg-white shadow-2xl flex flex-col z-10">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">Filtros</p>
                <button onClick={() => setPanelFiltros(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <div><p className="text-xs text-slate-400 mb-1">Nombre</p><FiltroInput placeholder="Nombre" value={draftNombre} onChange={setDraftNombre} opciones={usuarios.map(u => u.nombre)} className="w-full" /></div>
                <div><p className="text-xs text-slate-400 mb-1">Apellido</p><FiltroInput placeholder="Apellido" value={draftApellido} onChange={setDraftApellido} opciones={usuarios.map(u => u.apellido).filter(Boolean)} className="w-full" /></div>
                <div><p className="text-xs text-slate-400 mb-1">Correo</p><FiltroInput placeholder="Correo" value={draftCorreo} onChange={setDraftCorreo} opciones={usuarios.map(u => u.email)} className="w-full" /></div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Estado</p>
                  <div className="flex gap-2">
                    {["activo", "pendiente", "inactivo"].map(s => (
                      <button
                        key={s}
                        onClick={() => setDraftEstado(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors capitalize ${
                          draftEstado.includes(s)
                            ? s === "activo" ? "bg-green-700 border-green-700 text-white"
                            : s === "pendiente" ? "bg-amber-600 border-amber-600 text-white"
                            : "bg-slate-500 border-slate-500 text-white"
                            : "border-slate-300 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-slate-100 flex gap-2">
                <button onClick={limpiarDraft} className="flex-1 flex items-center justify-center gap-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-medium py-2 rounded-lg transition-colors">
                  <Eraser size={11} /> Limpiar
                </button>
                <button onClick={aplicarFiltros} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                  Buscar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Nombres</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Apellidos</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Correo</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">No se encontraron doctores.</td>
                </tr>
              ) : (
                usuariosFiltrados.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-800">{u.nombre}</td>
                    <td className="px-4 py-3 text-slate-800">{u.apellido}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[u.estado]}`}>
                        {u.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-3">
                      {u.estado === "activo" && (
                        <button onClick={() => setModalDesactivar(u)} className="text-red-700 hover:underline">Deshabilitar</button>
                      )}
                      {u.estado === "inactivo" && (
                        <button onClick={() => setModalReactivar(u)} className="text-green-700 hover:underline">Habilitar</button>
                      )}
                      {u.estado === "pendiente" && (
                        <button onClick={() => setModalReenviar(u)} className="text-slate-600 hover:underline">Reenviar invitación</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal invitar */}
      {modalInvitar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Invitar médico</h2>
            <form onSubmit={handleInvitar} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Correo electrónico</label>
                <input
                  type="text"
                  placeholder="Ingrese el correo de invitación"
                  value={emailInvitar}
                  onChange={e => { setEmailInvitar(e.target.value); setErrorInvitar("") }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
                {errorInvitar && (
                  <p className={`text-red-700 text-xs mt-1 transition-opacity duration-500 ${errorInvitarVisible ? "opacity-100" : "opacity-0"}`}>
                    {errorInvitar}
                  </p>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setModalInvitar(false); setEmailInvitar(""); setErrorInvitar("") }} className="text-xs text-slate-600 hover:text-slate-800 px-4 py-2">
                  Cancelar
                </button>
                <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                  Enviar invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal deshabilitar */}
      {modalDesactivar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Deshabilitar usuario</h2>
            <p className="text-xs text-slate-600">
              ¿Estás seguro que deseas deshabilitar a <span className="font-medium">{modalDesactivar.nombre} {modalDesactivar.apellido}</span>? El usuario no podrá iniciar sesión.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModalDesactivar(null)} className="text-xs text-slate-600 hover:text-slate-800 px-4 py-2">Cancelar</button>
              <button onClick={handleDesactivar} className="bg-red-700 hover:bg-red-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal reenviar invitación */}
      {modalReenviar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Reenviar invitación</h2>
            <p className="text-xs text-slate-600">
              ¿Estás seguro que deseas reenviar la invitación a <span className="font-medium">{modalReenviar.email}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModalReenviar(null)} className="text-xs text-slate-600 hover:text-slate-800 px-4 py-2">Cancelar</button>
              <button onClick={handleReenviar} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal habilitar */}
      {modalReactivar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Habilitar usuario</h2>
            <p className="text-xs text-slate-600">
              ¿Estás seguro que deseas habilitar a <span className="font-medium">{modalReactivar.nombre} {modalReactivar.apellido}</span>? El usuario podrá volver a iniciar sesión.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setModalReactivar(null)} className="text-xs text-slate-600 hover:text-slate-800 px-4 py-2">Cancelar</button>
              <button onClick={handleReactivar} className="bg-green-700 hover:bg-green-800 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
