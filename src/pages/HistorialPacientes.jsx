import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { X, Eraser, SlidersHorizontal, ChevronDown, ChevronRight } from "lucide-react"
import AppLayout from "../layouts/AppLayout"
import { usePacientes } from "../context/PacientesContext"

function calcularMeses(fechaNacimiento) {
  const hoy = new Date()
  const nac = new Date(fechaNacimiento)
  let meses = (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth())
  if (hoy.getDate() < nac.getDate()) meses--
  meses = Math.max(0, meses)
  return Math.floor(meses / 12) * 12
}

function FiltroInput({ placeholder, value, onChange, opciones, className = "w-full" }) {
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

  const opcionesUnicas = [...new Set(opciones.filter(Boolean))]
  const opcionesFiltradas = opcionesUnicas.filter(o => String(o).toLowerCase().includes(texto.toLowerCase()))

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
              <button key={o} onMouseDown={e => { e.preventDefault(); toggle(o) }} className="w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-slate-50 flex items-center gap-2">
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

export default function HistorialPacientes() {
  const { pacientes } = usePacientes()
  const navigate = useNavigate()
  const [panelFiltros, setPanelFiltros] = useState(false)

  // Filtros aplicados (afectan la tabla)
  const [filtroId, setFiltroId] = useState([])
  const [filtroNombres, setFiltroNombres] = useState([])
  const [filtroApellidos, setFiltroApellidos] = useState([])
  const [filtroEdad, setFiltroEdad] = useState([])
  const [filtroDni, setFiltroDni] = useState([])
  const [filtroSexo, setFiltroSexo] = useState([])
  const [filtroPeso, setFiltroPeso] = useState([])
  const [filtroTalla, setFiltroTalla] = useState([])
  const [filtroDepartamento, setFiltroDepartamento] = useState([])
  const [filtroEvaluaciones, setFiltroEvaluaciones] = useState([])
  const [filtroRiesgo, setFiltroRiesgo] = useState([])

  // Draft (solo viven en el drawer)
  const [draftId, setDraftId] = useState([])
  const [draftNombres, setDraftNombres] = useState([])
  const [draftApellidos, setDraftApellidos] = useState([])
  const [draftEdad, setDraftEdad] = useState([])
  const [draftDni, setDraftDni] = useState([])
  const [draftSexo, setDraftSexo] = useState([])
  const [draftPeso, setDraftPeso] = useState([])
  const [draftTalla, setDraftTalla] = useState([])
  const [draftDepartamento, setDraftDepartamento] = useState([])
  const [draftEvaluaciones, setDraftEvaluaciones] = useState([])
  const [draftRiesgo, setDraftRiesgo] = useState([])

  useEffect(() => {
    // placeholder para futuros efectos
  }, [])


  function abrirPanel() {
    setDraftId(filtroId); setDraftNombres(filtroNombres); setDraftApellidos(filtroApellidos)
    setDraftEdad(filtroEdad); setDraftDni(filtroDni); setDraftSexo(filtroSexo)
    setDraftPeso(filtroPeso); setDraftTalla(filtroTalla); setDraftDepartamento(filtroDepartamento)
    setDraftEvaluaciones(filtroEvaluaciones); setDraftRiesgo(filtroRiesgo)
    setPanelFiltros(true)
  }

  function aplicarFiltros() {
    setFiltroId(draftId); setFiltroNombres(draftNombres); setFiltroApellidos(draftApellidos)
    setFiltroEdad(draftEdad); setFiltroDni(draftDni); setFiltroSexo(draftSexo)
    setFiltroPeso(draftPeso); setFiltroTalla(draftTalla); setFiltroDepartamento(draftDepartamento)
    setFiltroEvaluaciones(draftEvaluaciones); setFiltroRiesgo(draftRiesgo)
    setPanelFiltros(false)
  }

  function limpiarDraft() {
    setDraftId([]); setDraftNombres([]); setDraftApellidos([]); setDraftEdad([])
    setDraftDni([]); setDraftSexo([]); setDraftPeso([]); setDraftTalla([])
    setDraftDepartamento([]); setDraftEvaluaciones([]); setDraftRiesgo([])
  }

  function limpiarFiltros() {
    setFiltroId([]); setFiltroNombres([]); setFiltroApellidos([]); setFiltroEdad([])
    setFiltroDni([]); setFiltroSexo([]); setFiltroPeso([]); setFiltroTalla([])
    setFiltroDepartamento([]); setFiltroEvaluaciones([]); setFiltroRiesgo([])
  }

  const labelFiltro = { filtroId: "ID", filtroNombres: "Nombres", filtroApellidos: "Apellidos", filtroEdad: "Edad", filtroDni: "DNI", filtroSexo: "Sexo", filtroPeso: "Peso", filtroTalla: "Talla", filtroDepartamento: "Departamento", filtroEvaluaciones: "Evaluaciones", filtroRiesgo: "Nivel de riesgo" }
  const setFiltroMap = { filtroId: setFiltroId, filtroNombres: setFiltroNombres, filtroApellidos: setFiltroApellidos, filtroEdad: setFiltroEdad, filtroDni: setFiltroDni, filtroSexo: setFiltroSexo, filtroPeso: setFiltroPeso, filtroTalla: setFiltroTalla, filtroDepartamento: setFiltroDepartamento, filtroEvaluaciones: setFiltroEvaluaciones, filtroRiesgo: setFiltroRiesgo }
  const filtroEntradas = [ ["filtroId", filtroId], ["filtroNombres", filtroNombres], ["filtroApellidos", filtroApellidos], ["filtroEdad", filtroEdad], ["filtroDni", filtroDni], ["filtroSexo", filtroSexo], ["filtroPeso", filtroPeso], ["filtroTalla", filtroTalla], ["filtroDepartamento", filtroDepartamento], ["filtroEvaluaciones", filtroEvaluaciones], ["filtroRiesgo", filtroRiesgo] ]
  const totalFiltros = filtroEntradas.reduce((acc, [, v]) => acc + v.length, 0)

  const pacientesConIndice = pacientes.map((p, i) => ({ ...p, indice: i + 1 }))

  const pacientesFiltrados = pacientesConIndice.filter(p => {
    return (
      (filtroId.length === 0 || filtroId.includes(String(p.indice))) &&
      (filtroNombres.length === 0 || filtroNombres.includes(p.nombres)) &&
      (filtroApellidos.length === 0 || filtroApellidos.includes(p.apellidos)) &&
      (filtroEdad.length === 0 || filtroEdad.some(f => parseInt(f) === calcularMeses(p.fechaNacimiento))) &&
      (filtroDni.length === 0 || filtroDni.includes(p.dni)) &&
      (filtroSexo.length === 0 || filtroSexo.includes(p.sexo)) &&
      (filtroPeso.length === 0 || filtroPeso.includes(p.peso)) &&
      (filtroTalla.length === 0 || filtroTalla.includes(p.talla)) &&
      (filtroDepartamento.length === 0 || filtroDepartamento.includes(p.departamento)) &&
      (filtroEvaluaciones.length === 0 || filtroEvaluaciones.includes(String(p.evaluaciones ?? 0))) &&
      (filtroRiesgo.length === 0 || filtroRiesgo.includes(p.ultimoRiesgo ?? "—"))
    )
  })

  const riesgoBadge = { alto: "bg-red-50 text-red-700", moderado: "bg-amber-50 text-amber-700", bajo: "bg-green-50 text-green-700" }

  return (
    <AppLayout>
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-slate-800">Historial de pacientes</h1>

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
                <div><p className="text-xs text-slate-400 mb-1">ID</p><FiltroInput placeholder="ID" value={draftId} onChange={setDraftId} opciones={pacientesConIndice.map(p => String(p.indice))} /></div>
                <div><p className="text-xs text-slate-400 mb-1">Nombres</p><FiltroInput placeholder="Nombres" value={draftNombres} onChange={setDraftNombres} opciones={pacientes.map(p => p.nombres)} /></div>
                <div><p className="text-xs text-slate-400 mb-1">Apellidos</p><FiltroInput placeholder="Apellidos" value={draftApellidos} onChange={setDraftApellidos} opciones={pacientes.map(p => p.apellidos)} /></div>
                <div><p className="text-xs text-slate-400 mb-1">Edad (meses)</p><FiltroInput placeholder="Edad" value={draftEdad} onChange={setDraftEdad} opciones={[...Array.from({length: 12}, (_, i) => String(i)), "12 (1 año)", "24 (2 años)", "36 (3 años)", "48 (4 años)"]} /></div>
                <div><p className="text-xs text-slate-400 mb-1">DNI</p><FiltroInput placeholder="DNI" value={draftDni} onChange={setDraftDni} opciones={pacientes.map(p => p.dni)} /></div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Sexo</p>
                  <div className="flex gap-2">
                    {["femenino", "masculino"].map(s => (
                      <button
                        key={s}
                        onClick={() => setDraftSexo(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors capitalize ${draftSexo.includes(s) ? "bg-slate-800 border-slate-800 text-white" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div><p className="text-xs text-slate-400 mb-1">Peso (kg)</p><FiltroInput placeholder="Peso" value={draftPeso} onChange={setDraftPeso} opciones={pacientes.map(p => p.peso)} /></div>
                <div><p className="text-xs text-slate-400 mb-1">Talla (cm)</p><FiltroInput placeholder="Talla" value={draftTalla} onChange={setDraftTalla} opciones={pacientes.map(p => p.talla)} /></div>
                <div><p className="text-xs text-slate-400 mb-1">Departamento</p><FiltroInput placeholder="Departamento" value={draftDepartamento} onChange={setDraftDepartamento} opciones={["Puno", "Loreto", "Apurímac", "Madre de Dios"]} /></div>
                <div><p className="text-xs text-slate-400 mb-1">Evaluaciones</p><FiltroInput placeholder="Evaluaciones" value={draftEvaluaciones} onChange={setDraftEvaluaciones} opciones={pacientes.map(p => String(p.evaluaciones ?? 0))} /></div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Nivel de riesgo</p>
                  <div className="flex gap-2">
                    {["bajo", "moderado", "alto"].map(r => (
                      <button
                        key={r}
                        onClick={() => setDraftRiesgo(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors capitalize ${
                          draftRiesgo.includes(r)
                            ? r === "bajo" ? "bg-green-700 border-green-700 text-white"
                            : r === "moderado" ? "bg-amber-600 border-amber-600 text-white"
                            : "bg-red-700 border-red-700 text-white"
                            : "border-slate-300 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {r}
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
                <th className="text-left px-4 py-3 font-medium text-slate-600">ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Nombres</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Apellidos</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Edad (meses)</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">DNI</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Sexo</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Peso (kg)</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Talla (cm)</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Departamento</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Evaluaciones</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Nivel de riesgo</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pacientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-6 text-center text-slate-400">No se encontraron pacientes.</td>
                </tr>
              ) : (
                pacientesFiltrados.map(p => (
                  <tr key={p.id} onClick={() => navigate(`/doctor/pacientes/${p.id}`)} className="hover:bg-slate-50 cursor-pointer group">
                    <td className="px-4 py-3 text-slate-400">{p.indice}</td>
                    <td className="px-4 py-3 text-slate-800">{p.nombres}</td>
                    <td className="px-4 py-3 text-slate-800">{p.apellidos}</td>
                    <td className="px-4 py-3 text-slate-600">{calcularMeses(p.fechaNacimiento)}</td>
                    <td className="px-4 py-3 text-slate-600">{p.dni}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{p.sexo}</td>
                    <td className="px-4 py-3 text-slate-600">{p.peso}</td>
                    <td className="px-4 py-3 text-slate-600">{p.talla}</td>
                    <td className="px-4 py-3 text-slate-600">{p.departamento}</td>
                    <td className="px-4 py-3 text-slate-600">{p.evaluaciones ?? 0}</td>
                    <td className="px-4 py-3">
                      {p.ultimoRiesgo ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${riesgoBadge[p.ultimoRiesgo]}`}>
                          {p.ultimoRiesgo.charAt(0).toUpperCase() + p.ultimoRiesgo.slice(1)}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300 group-hover:text-slate-800 transition-colors">
                      <ChevronRight size={14} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
