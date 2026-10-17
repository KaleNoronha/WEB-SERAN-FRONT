import { useEffect, useState } from "react"
import AppLayout from "../layouts/AppLayout"
import { useRecomendaciones, CATEGORIAS_RECOMENDACIONES } from "../context/RecomendacionesContext"
import api from "../api/api"
import { useAuth } from "../context/AuthContext"

export default function ConfigRecomendaciones() {
  const { config, setConfig } = useRecomendaciones()
  const [draft, setDraft] = useState({ ...config })
  const [pestana, setPestana] = useState("categorias")
  const [disponibles, setDisponibles] = useState({})
  const [filtros, setFiltros] = useState({ id: "", titulo: "", tipos: [], categorias: [], estados: [] })
  const [errorConfig, setErrorConfig] = useState("")
  const [exito, setExito] = useState(false)
  const [exitoVisible, setExitoVisible] = useState(false)
  
  const { usuario } = useAuth()
  const esAdmin = usuario?.rol === "admin"
  const esDoctor = usuario?.rol === "doctor"

  const [recomendaciones, setRecomendaciones] = useState([])
  const [cargando, setCargando] = useState(true)

  const [modalCrear, setModalCrear] = useState(false)
  const [modalEditar, setModalEditar] = useState(false)
  const [modalEliminar, setModalEliminar] = useState(null)
  const [recomendacionEditando, setRecomendacionEditando] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [formReco, setFormReco] = useState({
    titulo: "",
    descripcion: "",
    tipo_recomendacion: "Riesgo alto",
    categoria: "alimentacion",
  })
  const [errorReco, setErrorReco] = useState("")

  const modificado = CATEGORIAS_RECOMENDACIONES.some(c => draft[c.id] !== config[c.id])
  const activasCount = CATEGORIAS_RECOMENDACIONES.filter(c => draft[c.id]).length
  const tipos = [...new Set(recomendaciones.map(r => r.tipo_recomendacion))].sort()
  const estadoVisible = rec => esAdmin
    ? Boolean(rec.estado && draft[rec.categoria])
    : Boolean(rec.estado_efectivo ?? (rec.estado && config[rec.categoria]))
  const filtradas = recomendaciones.filter(rec => {
    if (filtros.id && !String(rec.id).includes(filtros.id.trim())) return false
    if (filtros.titulo && !rec.titulo.toLowerCase().includes(filtros.titulo.trim().toLowerCase())) return false
    if (filtros.tipos.length && !filtros.tipos.includes(rec.tipo_recomendacion)) return false
    if (filtros.categorias.length && !filtros.categorias.includes(rec.categoria)) return false
    if (filtros.estados.length && !filtros.estados.includes(estadoVisible(rec) ? "activa" : "inactiva")) return false
    return true
  })
  function alternarFiltro(campo, valor) {
    setFiltros(prev => ({
      ...prev,
      [campo]: prev[campo].includes(valor)
        ? prev[campo].filter(x => x !== valor)
        : [...prev[campo], valor]
    }))
  }

  useEffect(() => {
    cargarRecomendaciones()
  }, [])

  useEffect(() => {
    cargarConfigRecomendaciones()
  }, [])

  async function cargarRecomendaciones() {
    try {
      const response = await api.get("/api/recomendaciones/")

      setRecomendaciones(response.data)
    } catch (error) {
      console.error("Error al cargar recomendaciones:", error)
    } finally {
      setCargando(false)
    }
  }

  async function cargarConfigRecomendaciones() {
    try {
      const response = await api.get(esAdmin
        ? "/api/config-recomendaciones/global"
        : "/api/config-recomendaciones/")

      const configBackend = {}
      const disponiblesBackend = {}
      response.data.forEach(item => {
        configBackend[item.categoria] = item.activo
        disponiblesBackend[item.categoria] = item.disponible !== false
      })
      setDisponibles(disponiblesBackend)

      const configCompleta = { ...config, ...configBackend }

      setDraft(configCompleta)
      setConfig(configCompleta)
    } catch (error) {
      console.error("Error al cargar configuración de recomendaciones:", error)
    }
  }

  async function crearRecomendacion(e) {
    e.preventDefault()
    setErrorReco("")

    if (!formReco.titulo.trim()) {
      setErrorReco("Ingresa un título.")
      return
    }

    if (!formReco.descripcion.trim()) {
      setErrorReco("Ingresa una descripción.")
      return
    }

    try {
      setGuardando(true)

      await api.post("/api/recomendaciones/", {
        titulo: formReco.titulo.trim(),
        descripcion: formReco.descripcion.trim(),
        tipo_recomendacion: formReco.tipo_recomendacion,
        categoria: formReco.categoria,
      })

      setModalCrear(false)
      setFormReco({
        titulo: "",
        descripcion: "",
        tipo_recomendacion: "Riesgo alto",
        categoria: "alimentacion",
      })

      await cargarRecomendaciones()
    } catch (error) {
      console.error("Error al crear recomendación:", error)
      setErrorReco("No se pudo crear la recomendación.")
    } finally {
      setGuardando(false)
    }
  }

  function abrirEditar(rec) {
    setRecomendacionEditando({
      id: rec.id,
      titulo: rec.titulo ?? "",
      descripcion: rec.descripcion ?? "",
      tipo_recomendacion: rec.tipo_recomendacion ?? "Riesgo alto",
      categoria: rec.categoria ?? "alimentacion",
      estado: rec.estado ?? true,
    })
    setErrorReco("")
    setModalEditar(true)
  }

  async function editarRecomendacion(e) {
    e.preventDefault()
    setErrorReco("")

    if (!recomendacionEditando.titulo.trim()) {
      setErrorReco("Ingresa un título.")
      return
    }

    if (!recomendacionEditando.descripcion.trim()) {
      setErrorReco("Ingresa una descripción.")
      return
    }

    try {
      setGuardando(true)

      await api.put(`/api/recomendaciones/${recomendacionEditando.id}`, {
        titulo: recomendacionEditando.titulo.trim(),
        descripcion: recomendacionEditando.descripcion.trim(),
        tipo_recomendacion: recomendacionEditando.tipo_recomendacion,
        categoria: recomendacionEditando.categoria,
        estado: recomendacionEditando.estado,
      })

      setModalEditar(false)
      setRecomendacionEditando(null)
      setErrorReco("")

      await cargarRecomendaciones()
    } catch (error) {
      console.error("Error al editar recomendación:", error)
      setErrorReco("No se pudo editar la recomendación.")
    } finally {
      setGuardando(false)
    }
  }

  async function desactivarRecomendacion() {
    if (!modalEliminar) return

    try {
      setGuardando(true)

      await api.delete(`/api/recomendaciones/${modalEliminar.id}`)

      setModalEliminar(null)
      await cargarRecomendaciones()
    } catch (error) {
      console.error("Error al eliminar recomendación:", error)
      setErrorReco("No se pudo eliminar la recomendación.")
    } finally {
      setGuardando(false)
    }
  }

  async function activarRecomendacion(rec) {
    try {
      setGuardando(true)

      await api.put(`/api/recomendaciones/${rec.id}`, {
        titulo: rec.titulo,
        descripcion: rec.descripcion,
        tipo_recomendacion: rec.tipo_recomendacion,
        categoria: rec.categoria,
        estado: true,
      })

      await cargarRecomendaciones()
    } catch (error) {
      console.error("Error al activar recomendación:", error)
      setErrorReco("No se pudo activar la recomendación.")
    } finally {
      setGuardando(false)
    }
  }

  function handleCancelar() { setDraft({ ...config }) }

  async function handleGuardar() {
    try {
      const configuraciones = CATEGORIAS_RECOMENDACIONES.map(cat => ({
        categoria: cat.id,
        activo: draft[cat.id] === true,
      }))

      setErrorConfig("")
      await api.put(esAdmin
        ? "/api/config-recomendaciones/global"
        : "/api/config-recomendaciones/", { configuraciones })
      setConfig({ ...draft })
      await cargarRecomendaciones()

      setExito(true)
      setExitoVisible(false)
      setTimeout(() => setExitoVisible(true), 10)
      setTimeout(() => { setExito(false); setExitoVisible(false) }, 3000)
    } catch (error) {
      console.error("Error al guardar configuración:", error)
      setErrorConfig(error.response?.data?.detail || "No se pudo guardar la configuración de recomendaciones.")
    }
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <h1 className="text-xl font-bold text-slate-800">Recomendaciones</h1>
        <div className="flex gap-2 border-b border-slate-200">
          {[["categorias", "Categorías"], ["listado", "Listado de recomendaciones"]].map(([id, label]) => (
            <button key={id} type="button" onClick={() => setPestana(id)}
              className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${pestana === id ? "border-slate-800 text-slate-800" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              {label}
            </button>
          ))}
        </div>
        {exito && <p className="text-xs px-3 py-2 rounded-lg border bg-green-50 text-green-700 border-green-200">Configuración guardada correctamente.</p>}
        {errorConfig && <p className="text-xs text-red-700">{errorConfig}</p>}
        {pestana === "categorias" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              {activasCount} de {CATEGORIAS_RECOMENDACIONES.length} categorías activas
              {esAdmin ? " · Configuración global" : " · Mi configuración"}
            </p>
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
              {CATEGORIAS_RECOMENDACIONES.map(cat => {
                const activa = Boolean(draft[cat.id])
                const disponible = esAdmin || disponibles[cat.id] !== false
                return (
                  <div key={cat.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className={`text-xs font-medium ${activa ? "text-slate-800" : "text-slate-400"}`}>{cat.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{cat.descripcion}</p>
                      {!disponible && <p className="text-xs text-amber-700 mt-1">Deshabilitada por el administrador</p>}
                    </div>
                    <button type="button" role="switch" aria-checked={activa} aria-label={`Activar ${cat.label}`}
                      disabled={!disponible}
                      onClick={() => setDraft(prev => ({...prev, [cat.id]: !prev[cat.id]}))}
                      className={`relative inline-flex w-10 h-6 rounded-full transition-colors shrink-0 ${activa ? "bg-slate-800" : "bg-slate-200"} disabled:opacity-40 disabled:cursor-not-allowed`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${activa ? "translate-x-5" : "translate-x-1"}`}/>
                    </button>
                  </div>
                )
              })}
            </div>
            {modificado && (
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={handleCancelar} className="text-xs text-slate-600 px-4 py-2">Cancelar</button>
                <button type="button" onClick={handleGuardar} disabled={guardando}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-5 py-2 rounded-lg disabled:opacity-50">Guardar cambios</button>
              </div>
            )}
          </div>
        )}
        {pestana === "listado" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">{filtradas.length} de {recomendaciones.length} recomendaciones</p>
              {esAdmin && <button type="button" onClick={() => setModalCrear(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-4 py-2 rounded-lg">Nueva recomendación</button>}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" value={filtros.id} placeholder="Filtrar por ID" aria-label="Filtrar por ID"
                  onChange={e => setFiltros(prev => ({...prev, id: e.target.value}))}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-xs" />
                <input type="text" value={filtros.titulo} placeholder="Buscar por título" aria-label="Buscar por título"
                  onChange={e => setFiltros(prev => ({...prev, titulo: e.target.value}))}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-xs" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">Tipo (selección múltiple)</p>
                  <div className="flex flex-wrap gap-2">{tipos.map(tipo => <button key={tipo} type="button"
                    onClick={() => alternarFiltro("tipos", tipo)}
                    className={`px-2 py-1 rounded-full border text-xs ${filtros.tipos.includes(tipo) ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-600"}`}>{tipo}</button>)}</div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">Categoría (selección múltiple)</p>
                  <div className="flex flex-wrap gap-2">{CATEGORIAS_RECOMENDACIONES.map(cat => <button key={cat.id} type="button"
                    onClick={() => alternarFiltro("categorias", cat.id)}
                    className={`px-2 py-1 rounded-full border text-xs ${filtros.categorias.includes(cat.id) ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-600"}`}>{cat.label}</button>)}</div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-2">Estado</p>
                  <div className="flex flex-wrap gap-2">{[["activa", "Activa"], ["inactiva", "Inactiva"]].map(([id,label]) => <button key={id} type="button"
                    onClick={() => alternarFiltro("estados", id)}
                    className={`px-2 py-1 rounded-full border text-xs ${filtros.estados.includes(id) ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-600"}`}>{label}</button>)}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                {[["tipos", "Tipo"], ["categorias", "Categoría"], ["estados", "Estado"]].flatMap(([campo, etiqueta]) => filtros[campo].map(valor => (
                  <button type="button" key={`${campo}-${valor}`} onClick={() => alternarFiltro(campo, valor)}
                    className="px-2 py-1 bg-slate-100 rounded-full text-xs text-slate-700">{etiqueta}: {valor} ×</button>
                )))}
                <button type="button" onClick={() => setFiltros({id:"",titulo:"",tipos:[],categorias:[],estados:[]})}
                  className="text-xs text-slate-600 hover:underline ml-auto">Limpiar filtros</button>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
              {cargando ? <p className="p-6 text-xs text-slate-500">Cargando recomendaciones...</p>
                : filtradas.length === 0 ? <p className="p-6 text-xs text-slate-500">No hay recomendaciones que coincidan con los filtros.</p>
                : <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200"><tr>
                    {['ID','Título','Tipo','Categoría','Estado'].map(t => <th key={t} className="text-left px-4 py-3 font-medium text-slate-600">{t}</th>)}
                    {esAdmin && <th className="text-left px-4 py-3 font-medium text-slate-600">Acciones</th>}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-100">{filtradas.map(rec => <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-400">{rec.id}</td>
                    <td className="px-4 py-3"><p className="text-slate-800 font-medium">{rec.titulo}</p><p className="text-slate-400 mt-0.5 line-clamp-1">{rec.descripcion}</p></td>
                    <td className="px-4 py-3 text-slate-600">{rec.tipo_recomendacion}</td>
                    <td className="px-4 py-3 text-slate-600">{CATEGORIAS_RECOMENDACIONES.find(c => c.id === rec.categoria)?.label ?? rec.categoria}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${estadoVisible(rec) ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {estadoVisible(rec) ? "Activa" : "Inactiva"}</span></td>
                    {esAdmin && <td className="px-4 py-3 space-x-3">
                      <button type="button" onClick={() => abrirEditar(rec)} className="text-slate-600 hover:underline">Editar</button>
                      {rec.estado ? <button type="button" onClick={() => setModalEliminar(rec)} className="text-red-700 hover:underline">Desactivar</button>
                        : <button type="button" onClick={() => activarRecomendacion(rec)} className="text-green-700 hover:underline">Activar</button>}
                    </td>}
                  </tr>)}</tbody>
                </table>}
            </div>
          </div>
        )}
      </div>

      {esAdmin && modalCrear && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Nueva recomendación</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Registra una recomendación por nivel de riesgo y categoría.
              </p>
            </div>

            <form onSubmit={crearRecomendacion} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={formReco.titulo}
                  onChange={e => setFormReco(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="Ej: Mejorar alimentación rica en hierro"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formReco.descripcion}
                  onChange={e => setFormReco(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500 min-h-24"
                  placeholder="Describe la recomendación..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tipo de recomendación
                  </label>
                  <select
                    value={formReco.tipo_recomendacion}
                    onChange={e => setFormReco(prev => ({ ...prev, tipo_recomendacion: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="Riesgo bajo">Riesgo bajo</option>
                    <option value="Riesgo moderado">Riesgo moderado</option>
                    <option value="Riesgo alto">Riesgo alto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formReco.categoria}
                    onChange={e => setFormReco(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    {CATEGORIAS_RECOMENDACIONES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
             {errorReco && (
                <p className="text-red-700 text-xs">{errorReco}</p>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalCrear(false)
                    setErrorReco("")
                    setFormReco({
                      titulo: "",
                      descripcion: "",
                      tipo_recomendacion: "Riesgo alto",
                      categoria: "alimentacion",
                    })
                  }}
                  className="text-xs text-slate-600 hover:text-slate-800 px-4 py-2"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {esAdmin && modalEditar && recomendacionEditando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Editar recomendación</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Modifica la recomendación seleccionada.
              </p>
            </div>

            <form onSubmit={editarRecomendacion} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Título</label>
                <input
                  type="text"
                  value={recomendacionEditando.titulo}
                  onChange={e => setRecomendacionEditando(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  value={recomendacionEditando.descripcion}
                  onChange={e => setRecomendacionEditando(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500 min-h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
                  <select
                    value={recomendacionEditando.tipo_recomendacion}
                    onChange={e => setRecomendacionEditando(prev => ({ ...prev, tipo_recomendacion: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="Riesgo bajo">Riesgo bajo</option>
                    <option value="Riesgo moderado">Riesgo moderado</option>
                    <option value="Riesgo alto">Riesgo alto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Categoría</label>
                  <select
                    value={recomendacionEditando.categoria}
                    onChange={e => setRecomendacionEditando(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    {CATEGORIAS_RECOMENDACIONES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={recomendacionEditando.estado}
                  onChange={e => setRecomendacionEditando(prev => ({ ...prev, estado: e.target.checked }))}
                />
                Recomendación activa
              </label>

              {errorReco && (
                <p className="text-red-700 text-xs">{errorReco}</p>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalEditar(false)
                    setRecomendacionEditando(null)
                    setErrorReco("")
                  }}
                  className="text-xs text-slate-600 hover:text-slate-800 px-4 py-2"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {esAdmin && modalEliminar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Desactivar recomendación
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                ¿Estás seguro que deseas desactivar la recomendación{" "}
                <span className="font-medium text-slate-700">
                  {modalEliminar.titulo}
                </span>
                ? La recomendación dejará de usarse en nuevas evaluaciones, pero se conservará para trazabilidad.
              </p>
            </div>

            {errorReco && (
              <p className="text-red-700 text-xs">{errorReco}</p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setModalEliminar(null)
                  setErrorReco("")
                }}
                className="text-xs text-slate-600 hover:text-slate-800 px-4 py-2"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={desactivarRecomendacion}
                disabled={guardando}
                className="bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white text-xs font-medium px-5 py-2 rounded-lg transition-colors"
              >
                {guardando ? "Desactivando..." : "Desactivar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </AppLayout>
  )
}