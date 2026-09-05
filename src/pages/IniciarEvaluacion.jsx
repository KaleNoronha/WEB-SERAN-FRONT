import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import AppLayout from "../layouts/AppLayout"
import { usePacientes } from "../context/PacientesContext"
import { useRecomendaciones } from "../context/RecomendacionesContext"
import { evaluarRespuestas, RECOMENDACIONES } from "../utils/evaluacionEngine"
import SelectCustom from "../components/SelectCustom"

const SECCIONES = [
  {
    id: "antecedentes",
    titulo: "Antecedentes al nacer",
    preguntas: [
      { id: "prematuro", texto: "¿El niño nació antes de tiempo (prematuro)?", tipo: "booleano" },
      { id: "bajoPeso", texto: "¿El niño nació con bajo peso (menos de 2.5 kg)?", tipo: "booleano" },
      { id: "anemiaEmbarazo", texto: "¿La madre tuvo anemia durante el embarazo?", tipo: "booleano" },
    ],
  },
  {
    id: "alimentacion",
    titulo: "Alimentación y Nutrición",
    preguntas: [
      { id: "carneVisceras", texto: "¿El niño consume alimentos como sangrecita, hígado, bazo o carne?", tipo: "booleano" },
      { id: "menestras", texto: "¿El niño come menestras (lentejas, frejoles)?", tipo: "booleano" },
      { id: "carbohidratos", texto: "¿El niño come principalmente arroz, papa o fideos?", tipo: "booleano" },
      { id: "alimentosDesde6m", texto: "¿Desde los 6 meses empezó a comer alimentos además de la leche?", tipo: "booleano" },
      { id: "buenApetito", texto: "¿El niño tiene buen apetito actualmente?", tipo: "booleano" },
    ],
  },
  {
    id: "suplementacion",
    titulo: "Suplementación y Controles",
    preguntas: [
      { id: "recibeHierro", texto: "¿El niño recibe hierro o micronutrientes?", tipo: "booleano" },
      { id: "tomaDiario", texto: "Si recibe: ¿los toma todos los días?", tipo: "booleano" },
      { id: "asisteCred", texto: "¿El niño asiste a sus controles de crecimiento y desarrollo?", tipo: "booleano" },
      { id: "mesesUltimoControl", texto: "¿Hace cuánto fue su último control de salud? (meses)", tipo: "numero", placeholder: "Ej: 3" },
    ],
  },
  {
    id: "sintomas",
    titulo: "Síntomas",
    preguntas: [
      { id: "palido", texto: "¿El niño se ve pálido (cara, labios o manos)?", tipo: "booleano" },
      { id: "cansancio", texto: "¿El niño se cansa rápido o está decaído?", tipo: "booleano" },
      { id: "perdidaApetito", texto: "¿El niño ha perdido el apetito?", tipo: "booleano" },
    ],
  },
  {
    id: "enfermedades",
    titulo: "Enfermedades recientes",
    preguntas: [
      { id: "diarrea", texto: "¿El niño ha tenido diarrea en las últimas semanas?", tipo: "booleano" },
      { id: "infecciones", texto: "¿Ha tenido tos o infecciones frecuentes?", tipo: "booleano" },
      { id: "parasitos", texto: "¿Ha tenido parásitos?", tipo: "booleano" },
      { id: "desparasitado", texto: "¿El niño ha sido desparasitado?", tipo: "booleano" },
    ],
  },
  {
    id: "hogar",
    titulo: "Condiciones sanitarias",
    preguntas: [
      { id: "aguaSegura", texto: "¿El agua que consumen es segura (hervida o tratada)?", tipo: "booleano" },
      { id: "bajoPesoEdad", texto: "¿El personal de salud observa bajo peso para su edad?", tipo: "booleano" },
      { id: "tallaEdad", texto: "¿El personal de salud observa talla baja para su edad?", tipo: "booleano" },
      { id: "delgadez", texto: "¿El personal de salud observa delgadez para su edad?", tipo: "booleano" },
      { id: "faltaComida", texto: "¿En casa a veces falta comida?", tipo: "booleano" },
    ],
  },
  {
    id: "pruebas",
    titulo: "Pruebas médicas",
    preguntas: [
      { id: "hemoglobinaMedida", texto: "¿Al niño le han medido la hemoglobina alguna vez?", tipo: "booleano" },
      { id: "valorHemoglobina", texto: "¿Cuál fue el valor de hemoglobina (si lo conoce)?", tipo: "decimal", placeholder: "Ej: 11.5" },
      { id: "fechaPrueba", texto: "¿Cuándo se realizó la prueba?", tipo: "fecha" },
      { id: "lugarPrueba", texto: "¿Dónde se realizó la prueba?", tipo: "opcion", opciones: ["Posta", "Campaña", "Hospital"] },
    ],
  },
]

const opcionesPacientes = (pacientes) =>
  pacientes.map(p => ({ value: String(p.id), label: `${p.nombres} ${p.apellidos}` }))

function initRespuestas() {
  const r = {}
  SECCIONES.forEach(s => s.preguntas.forEach(p => { r[p.id] = "" }))
  return r
}

export default function IniciarEvaluacion() {
  const { pacientes, setPacientes } = usePacientes()
  const { config } = useRecomendaciones()
  const navigate = useNavigate()
  const [pacienteId, setPacienteId] = useState("")
  const [iniciado, setIniciado] = useState(false)
  const [seccionActual, setSeccionActual] = useState(0)
  const [respuestas, setRespuestas] = useState(initRespuestas())
  const [errores, setErrores] = useState({})
  const [erroresVisibles, setErroresVisibles] = useState({})
  const [completadas, setCompletadas] = useState([])
  const [finalizado, setFinalizado] = useState(false)

  const seccion = SECCIONES[seccionActual]
  const esUltima = seccionActual === SECCIONES.length - 1

  function mostrarError(campo, msg) {
    setErrores(prev => ({ ...prev, [campo]: msg }))
    setErroresVisibles(prev => ({ ...prev, [campo]: false }))
    setTimeout(() => setErroresVisibles(prev => ({ ...prev, [campo]: true })), 10)
  }

  function validarSeccion() {
    let valido = true
    const hemoglobinaNegada = seccion.id === "pruebas" && respuestas.hemoglobinaMedida === "no"
    seccion.preguntas.forEach(p => {
      if (hemoglobinaNegada && p.id !== "hemoglobinaMedida") return
      const val = respuestas[p.id]
      if (p.tipo === "booleano") {
        if (val === "") { mostrarError(p.id, "Selecciona una opción"); valido = false }
      } else if (p.tipo === "numero") {
        if (val === "") { mostrarError(p.id, "Ingresa un valor"); valido = false }
        else if (isNaN(val) || Number(val) < 0) { mostrarError(p.id, "Ingresa un número válido"); valido = false }
      } else if (p.tipo === "decimal") {
        if (val === "") { mostrarError(p.id, "Ingresa un valor"); valido = false }
        else if (isNaN(val) || Number(val) <= 0) { mostrarError(p.id, "Ingresa un valor decimal válido"); valido = false }
      } else if (p.tipo === "fecha") {
        if (!val) { mostrarError(p.id, "Selecciona una fecha"); valido = false }
      } else if (p.tipo === "opcion") {
        if (!val) { mostrarError(p.id, "Selecciona una opción"); valido = false }
      }
    })
    return valido
  }

  function handleSiguiente() {
    if (!validarSeccion()) return
    setCompletadas(prev => [...new Set([...prev, seccionActual])])
    setSeccionActual(prev => prev + 1)
    setErrores({})
  }

  function handleFinalizar() {
    if (!validarSeccion()) return
    setCompletadas(prev => [...new Set([...prev, seccionActual])])

    const fecha = new Date().toLocaleDateString("es-PE")
    const { reglasEvaluadas, total, nivel } = evaluarRespuestas(respuestas)
    const recomendaciones = Object.entries(RECOMENDACIONES[nivel])
      .filter(([cat]) => config[cat])
      .map(([cat, texto]) => ({ categoria: cat, texto }))

    setPacientes(prev => prev.map(p => {
      if (String(p.id) !== pacienteId) return p
      const historial = p.historialEvaluaciones ?? []
      return {
        ...p,
        evaluaciones: (p.evaluaciones ?? 0) + 1,
        ultimoRiesgo: nivel,
        historialEvaluaciones: [...historial, { fecha, riesgo: nivel, respuestas: { ...respuestas }, reglasEvaluadas, total, recomendaciones }],
      }
    }))
    setFinalizado(true)
  }

  function reiniciar() {
    setPacienteId(""); setIniciado(false); setSeccionActual(0)
    setRespuestas(initRespuestas()); setErrores({}); setCompletadas([]); setFinalizado(false)
  }

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"

  if (finalizado) {
    const paciente = pacientes.find(p => String(p.id) === pacienteId)
    const evalIdxFinal = (paciente?.historialEvaluaciones?.length ?? 1) - 1
    const riesgo = paciente?.ultimoRiesgo
    const badge = { bajo: "bg-green-50 text-green-700 border-green-200", moderado: "bg-amber-50 text-amber-700 border-amber-200", alto: "bg-red-50 text-red-700 border-red-200" }
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center flex-1 gap-4 py-12">
          <CheckCircle2 size={48} className="text-green-600" />
          <h1 className="text-xl font-bold text-slate-800">Evaluación completada</h1>
          <p className="text-xs text-slate-500">Paciente: <span className="font-medium text-slate-700">{paciente?.nombres} {paciente?.apellidos}</span></p>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${badge[riesgo]}`}>
            Nivel de riesgo: {riesgo?.charAt(0).toUpperCase() + riesgo?.slice(1)}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={reiniciar} className="border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium px-6 py-2 rounded-lg transition-colors">
              Nueva evaluación
            </button>
            <button onClick={() => navigate(`/doctor/pacientes/${pacienteId}`, { state: { tab: "detalle", evalIdx: evalIdxFinal } })} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-6 py-2 rounded-lg transition-colors">
              Ver detalle de evaluación
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!iniciado) {
    return (
      <AppLayout>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-800">Iniciar evaluación</h1>
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Selecciona un paciente</label>
              <SelectCustom
                placeholder="Buscar paciente..."
                value={pacienteId}
                onChange={setPacienteId}
                opciones={opcionesPacientes(pacientes)}
              />
            </div>
            <button
              onClick={() => { if (pacienteId) setIniciado(true) }}
              disabled={!pacienteId}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded-lg transition-colors"
            >
              Iniciar evaluación
            </button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-slate-800">Evaluación</h1>

        {/* Paciente */}
        {(() => {
          const paciente = pacientes.find(p => String(p.id) === pacienteId)
          return paciente ? (
            <p className="text-xs text-slate-500">Paciente: <span className="font-medium text-slate-700">{paciente.nombres} {paciente.apellidos}</span></p>
          ) : null
        })()}

        {/* Barra de progreso */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex gap-1.5">
            {SECCIONES.map((s, i) => (
              <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                <div className={`h-1.5 w-full rounded-full transition-colors ${
                  completadas.includes(i) ? "bg-slate-800" : i === seccionActual ? "bg-slate-400" : "bg-slate-100"
                }`} />
                <span className={`text-[10px] text-center leading-tight hidden sm:block ${
                  completadas.includes(i) ? "text-slate-800 font-medium" : i === seccionActual ? "text-slate-600" : "text-slate-300"
                }`}>{s.titulo}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">Sección {seccionActual + 1} de {SECCIONES.length}: <span className="font-medium text-slate-600">{seccion.titulo}</span></p>
        </div>

        {/* Preguntas */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          {seccion.preguntas.map(p => {
            const bloqueada = seccion.id === "pruebas" && p.id !== "hemoglobinaMedida" && respuestas.hemoglobinaMedida === "no"
            return (
            <div key={p.id} className={bloqueada ? "opacity-40 pointer-events-none select-none" : ""}>
              <p className="text-xs font-medium text-slate-700 mb-2">{p.texto}</p>
              {p.tipo === "booleano" && (
                <div className="flex gap-2">
                  {["si", "no"].map(op => (
                    <button
                      key={op}
                      onClick={() => { setRespuestas(prev => ({ ...prev, [p.id]: op })); setErrores(prev => ({ ...prev, [p.id]: "" })) }}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors capitalize ${
                        respuestas[p.id] === op ? "bg-slate-800 border-slate-800 text-white" : "border-slate-300 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {op === "si" ? "Sí" : "No"}
                    </button>
                  ))}
                </div>
              )}
              {(p.tipo === "numero" || p.tipo === "decimal") && (
                <input
                  type="text"
                  placeholder={p.placeholder}
                  value={respuestas[p.id]}
                  onChange={e => { setRespuestas(prev => ({ ...prev, [p.id]: e.target.value })); setErrores(prev => ({ ...prev, [p.id]: "" })) }}
                  className={inputClass}
                />
              )}
              {p.tipo === "fecha" && (
                <input
                  type="date"
                  value={respuestas[p.id]}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={e => { setRespuestas(prev => ({ ...prev, [p.id]: e.target.value })); setErrores(prev => ({ ...prev, [p.id]: "" })) }}
                  className={inputClass}
                />
              )}
              {p.tipo === "opcion" && (
                <SelectCustom
                  placeholder="Selecciona..."
                  value={respuestas[p.id]}
                  onChange={v => { setRespuestas(prev => ({ ...prev, [p.id]: v })); setErrores(prev => ({ ...prev, [p.id]: "" })) }}
                  opciones={p.opciones.map(o => ({ value: o.toLowerCase(), label: o }))}
                />
              )}
              {errores[p.id] && (
                <p className={`text-red-700 text-xs mt-1 transition-opacity duration-500 ${erroresVisibles[p.id] ? "opacity-100" : "opacity-0"}`}>
                  {errores[p.id]}
                </p>
              )}
            </div>
            )
          })}
        </div>

        {/* Navegación */}
        <div className="flex justify-between">
          <button
            onClick={() => { if (seccionActual > 0) { setSeccionActual(prev => prev - 1); setErrores({}) } }}
            disabled={seccionActual === 0}
            className="text-xs text-slate-600 hover:text-slate-800 px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          {esUltima ? (
            <button onClick={handleFinalizar} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-6 py-2 rounded-lg transition-colors">
              Finalizar evaluación
            </button>
          ) : (
            <button onClick={handleSiguiente} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-6 py-2 rounded-lg transition-colors">
              Siguiente
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
