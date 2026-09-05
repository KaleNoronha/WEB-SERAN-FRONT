import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import AppLayout from "../layouts/AppLayout"
import { usePacientes } from "../context/PacientesContext"
import { useRecomendaciones } from "../context/RecomendacionesContext"
import SelectCustom from "../components/SelectCustom"
import api from "../api/api"

const SECCIONES = [
    {
      id: "antecedentes",
      titulo: "Antecedentes al nacer",
      preguntas: [
        {
          id: "prematuro",
          texto: "¿El niño nació antes de tiempo (prematuro)?",
          tipo: "booleano",
          opciones: [
            { value: "si", label: "Sí" },
            { value: "no", label: "No" },
            { value: "no_sabe", label: "No sabe" },
          ],
        },
        {
          id: "bajoPeso",
          texto: "¿El niño nació con bajo peso (menos de 2.5 kg)?",
          tipo: "booleano",
          opciones: [
            { value: "si", label: "Sí" },
            { value: "no", label: "No" },
            { value: "no_sabe", label: "No sabe" },
          ],
        },
        {
          id: "anemiaEmbarazo",
          texto: "¿La madre tuvo anemia durante el embarazo?",
          tipo: "booleano",
          opciones: [
            { value: "si", label: "Sí" },
            { value: "no", label: "No" },
            { value: "no_sabe", label: "No sabe" },
          ],
        },
      ],
    },
    {
      id: "alimentacion",
      titulo: "Alimentación y Nutrición",
      preguntas: [
        {
          id: "carneVisceras",
          texto: "¿Con qué frecuencia el niño consume alimentos ricos en hierro como sangrecita, hígado, bazo, carne o pescado?",
          tipo: "opcion",
          opciones: [
            { value: "Todos los días", label: "Todos los días" },
            { value: "3 a 5 veces por semana", label: "3 a 5 veces por semana" },
            { value: "1 a 2 veces por semana", label: "1 a 2 veces por semana" },
            { value: "Casi nunca o nunca", label: "Casi nunca o nunca" },
          ],
        },
        {
          id: "menestras",
          texto: "¿Con qué frecuencia el niño come menestras como lentejas, frejoles, pallares o garbanzos?",
          tipo: "opcion",
          opciones: [
            { value: "3 o más veces por semana", label: "3 o más veces por semana" },
            { value: "1 a 2 veces por semana", label: "1 a 2 veces por semana" },
            { value: "Casi nunca o nunca", label: "Casi nunca o nunca" },
          ],
        },
        {
          id: "carbohidratos",
          texto: "¿El niño come principalmente arroz, papa, fideos u otros carbohidratos, con poco consumo de alimentos ricos en hierro?",
          tipo: "booleano",
        },
        {
          id: "alimentosDesde6m",
          texto: "¿Desde los 6 meses empezó a comer alimentos además de la leche?",
          tipo: "booleano",
          opciones: [
            { value: "si", label: "Sí" },
            { value: "no", label: "No" },
            { value: "no_aplica", label: "No aplica, menor de 6 meses" },
            { value: "no_sabe", label: "No sabe" },
          ],
        },
        {
          id: "buenApetito",
          texto: "¿El niño tiene buen apetito actualmente?",
          tipo: "booleano",
        },
      ],
    },
    {
      id: "suplementacion",
      titulo: "Suplementación y Controles",
      preguntas: [
        {
          id: "recibeHierro",
          texto: "¿El niño recibe hierro, micronutrientes o sulfato ferroso?",
          tipo: "booleano",
          opciones: [
            { value: "si", label: "Sí" },
            { value: "no", label: "No" },
            { value: "no_sabe", label: "No sabe" },
          ],
        },
        {
          id: "tomaDiario",
          texto: "Si recibe suplemento: ¿con qué frecuencia lo toma?",
          tipo: "opcion",
          dependeDe: "recibeHierro",
          mostrarSi: "si",
          opciones: [
            { value: "Siempre", label: "Siempre" },
            { value: "A veces", label: "A veces" },
            { value: "Casi nunca", label: "Casi nunca" },
            { value: "No sabe", label: "No sabe" },
          ],
        },
        {
          id: "asisteCred",
          texto: "¿El niño asiste a sus controles de crecimiento y desarrollo (CRED)?",
          tipo: "booleano",
          opciones: [
            { value: "si", label: "Sí" },
            { value: "no", label: "No" },
            { value: "no_sabe", label: "No sabe" },
          ],
        },
        {
          id: "mesesUltimoControl",
          texto: "¿Hace cuánto fue su último control de salud?",
          tipo: "opcion",
          opciones: [
            { value: "Menos de 1 mes", label: "Menos de 1 mes" },
            { value: "1 a 2 meses", label: "1 a 2 meses" },
            { value: "3 a 5 meses", label: "3 a 5 meses" },
            { value: "6 meses o más", label: "6 meses o más" },
            { value: "Nunca", label: "Nunca" },
            { value: "No sabe", label: "No sabe" },
          ],
        },
      ],
    },
    {
      id: "sintomas",
      titulo: "Síntomas",
      preguntas: [
        {
          id: "palido",
          texto: "¿El niño se ve pálido en cara, labios, manos o conjuntiva?",
          tipo: "booleano",
        },
        {
          id: "cansancio",
          texto: "¿El niño se cansa rápido o está decaído?",
          tipo: "booleano",
        },
        {
          id: "perdidaApetito",
          texto: "¿El niño ha perdido el apetito?",
          tipo: "booleano",
        },
      ],
    },
    {
      id: "enfermedades",
      titulo: "Enfermedades recientes",
      preguntas: [
        {
          id: "diarrea",
          texto: "¿El niño ha tenido diarrea en las últimas semanas?",
          tipo: "booleano",
          opciones: [
            { value: "si", label: "Sí" },
            { value: "no", label: "No" },
            { value: "no_sabe", label: "No sabe" },
          ],
        },
        {
          id: "infecciones",
          texto: "¿Ha tenido tos, fiebre o infecciones frecuentes recientemente?",
          tipo: "booleano",
          opciones: [
            { value: "si", label: "Sí" },
            { value: "no", label: "No" },
            { value: "no_sabe", label: "No sabe" },
          ],
        },
        {
          id: "parasitos",
          texto: "¿El niño ha tenido parásitos o sospecha de parasitosis?",
          tipo: "booleano",
          opciones: [
            { value: "si", label: "Sí" },
            { value: "no", label: "No" },
            { value: "no_sabe", label: "No sabe" },
          ],
        },
        {
          id: "desparasitado",
          texto: "¿El niño ha sido desparasitado?",
          tipo: "booleano",
          opciones: [
            { value: "si", label: "Sí" },
            { value: "no", label: "No" },
            { value: "no_sabe", label: "No sabe" },
          ],
        },
      ],
    },
    {
      id: "hogar",
      titulo: "Condiciones del hogar y estado nutricional",
      preguntas: [
        {
          id: "aguaSegura",
          texto: "¿El agua que consumen es segura, hervida, tratada o clorada?",
          tipo: "booleano",
          opciones: [
            { value: "si", label: "Sí" },
            { value: "no", label: "No" },
            { value: "no_sabe", label: "No sabe" },
          ],
        },
        {
          id: "bajoPesoEdad",
          texto: "¿El personal de salud observa bajo peso para su edad?",
          tipo: "booleano",
        },
        {
          id: "tallaEdad",
          texto: "¿El personal de salud observa talla baja para su edad?",
          tipo: "booleano",
        },
        {
          id: "delgadez",
          texto: "¿El personal de salud observa delgadez para su edad?",
          tipo: "booleano",
        },
        {
          id: "faltaComida",
          texto: "¿Con qué frecuencia falta comida en casa?",
          tipo: "opcion",
          opciones: [
            { value: "Siempre", label: "Siempre" },
            { value: "Casi siempre", label: "Casi siempre" },
            { value: "A veces", label: "A veces" },
            { value: "Rara vez", label: "Rara vez" },
            { value: "Nunca", label: "Nunca" },
          ],
        },
      ],
    },
    {
      id: "pruebas",
      titulo: "Pruebas médicas",
      preguntas: [
        {
          id: "hemoglobinaMedida",
          texto: "¿Al niño le han medido la hemoglobina alguna vez?",
          tipo: "booleano",
        },
        {
          id: "valorHemoglobina",
          texto: "¿Cuál fue el valor de hemoglobina?",
          tipo: "decimal_hemoglobina",
          placeholder: "Ej: 11.5",
          dependeDe: "hemoglobinaMedida",
          mostrarSi: "si",
        },
        {
          id: "fechaPrueba",
          texto: "¿Cuándo se realizó la prueba de hemoglobina?",
          tipo: "opcion",
          dependeDe: "hemoglobinaMedida",
          mostrarSi: "si",
          opciones: [
            { value: "Menos de 1 mes", label: "Menos de 1 mes" },
            { value: "1 a 3 meses", label: "1 a 3 meses" },
            { value: "4 a 6 meses", label: "4 a 6 meses" },
            { value: "Más de 6 meses", label: "Más de 6 meses" },
            { value: "No sabe", label: "No sabe" },
          ],
        },
        {
          id: "lugarPrueba",
          texto: "¿Dónde se realizó la prueba de hemoglobina?",
          tipo: "opcion",
          dependeDe: "hemoglobinaMedida",
          mostrarSi: "si",
          opciones: [
            { value: "Centro de salud", label: "Centro de salud" },
            { value: "Hospital", label: "Hospital" },
            { value: "Campaña de salud", label: "Campaña de salud" },
            { value: "Institución educativa", label: "Institución educativa" },
            { value: "Otro", label: "Otro" },
            { value: "No sabe", label: "No sabe" },
          ],
        },
      ],
    },
  ]

const CODIGO_BACKEND = {
  prematuro: "prematuro",
  bajoPeso: "bajo_peso_nacer",
  anemiaEmbarazo: "anemia_materna_embarazo",

  carneVisceras: "consume_hierro",
  menestras: "consume_menestras",
  carbohidratos: "dieta_carbohidratos",
  alimentosDesde6m: "alimentacion_complementaria",
  buenApetito: "buen_apetito",

  recibeHierro: "recibe_hierro_micronutrientes",
  tomaDiario: "toma_suplemento_diario",
  asisteCred: "asiste_controles_cred",
  mesesUltimoControl: "tiempo_ultimo_control",

  palido: "palidez",
  cansancio: "cansancio_decaimiento",
  perdidaApetito: "perdida_apetito",

  diarrea: "diarrea_reciente",
  infecciones: "infecciones_frecuentes",
  parasitos: "parasitos",
  desparasitado: "desparasitado",

  aguaSegura: "agua_segura",
  bajoPesoEdad: "bajo_peso_observado",
  tallaEdad: "baja_talla_observado",
  delgadez: "delgadez_observado",
  faltaComida: "inseguridad_alimentaria",

  hemoglobinaMedida: "hemoglobina_medida",
  valorHemoglobina: "valor_hemoglobina",
  fechaPrueba: "fecha_prueba_hemoglobina",
  lugarPrueba: "lugar_prueba_hemoglobina",
}

const opcionesPacientes = (pacientes) =>
  pacientes.map(p => ({ value: String(p.id), label: `${p.nombres} ${p.apellidos}` }))

function initRespuestas() {
  const r = {}

  SECCIONES.forEach(s => {
    if (!s.preguntas || !Array.isArray(s.preguntas)) return

    s.preguntas.forEach(p => {
      r[p.id] = ""
    })
  })

  return r
}

function opcionesDePregunta(pregunta) {
    if (!pregunta.opciones) {
      return [
        { value: "si", label: "Sí" },
        { value: "no", label: "No" },
      ]
    }

    return pregunta.opciones.map(opcion => {
      if (typeof opcion === "string") {
        return {
          value: opcion,
          label: opcion,
        }
      }

      return opcion
    })
  }

  function convertirRespuestaParaBackend(valor) {
    if (valor === "si") return "Si"
    if (valor === "no") return "No"
    if (valor === "no_sabe") return "No sabe"
    if (valor === "no_aplica") return "No aplica, menor de 6 meses"
    if (valor === "no_recuerda") return "No sabe / no recuerda"

    return valor
  }

export default function IniciarEvaluacion() {
  const { pacientes, setPacientes } = usePacientes()
  const [pacientesBackend, setPacientesBackend] = useState([])
  const [cargandoPacientes, setCargandoPacientes] = useState(true)
  const { config } = useRecomendaciones()
  const navigate = useNavigate()
  const location = useLocation()
  const [pacienteId, setPacienteId] = useState("")
  const [iniciado, setIniciado] = useState(false)
  const [seccionActual, setSeccionActual] = useState(0)
  const [respuestas, setRespuestas] = useState(initRespuestas())
  const [errores, setErrores] = useState({})
  const [erroresVisibles, setErroresVisibles] = useState({})
  const [completadas, setCompletadas] = useState([])
  const [finalizado, setFinalizado] = useState(false)
  const [resultadoFinal, setResultadoFinal] = useState(null)
  const [evaluacionId, setEvaluacionId] = useState(null)
  const [modoContinuar, setModoContinuar] = useState(false)
  const [preguntasBackend, setPreguntasBackend] = useState([])
  const [resultadoBackend, setResultadoBackend] = useState(null)

  const seccion = SECCIONES[seccionActual]
  const esUltima = seccionActual === SECCIONES.length - 1
  const pacientesLista = pacientesBackend.length > 0 ? pacientesBackend : pacientes

  useEffect(() => {
  cargarPacientes()
  cargarPreguntas()
}, [])

useEffect(() => {
  if (location.state?.modo === "continuar") {
    const evaluacionIdContinuar = location.state.evaluacionId
    const pacienteIdContinuar = location.state.pacienteId

    if (evaluacionIdContinuar && pacienteIdContinuar) {
      setEvaluacionId(evaluacionIdContinuar)
      setPacienteId(String(pacienteIdContinuar))
      setModoContinuar(true)
      setIniciado(true)
    }
  }
}, [location.state])

  async function cargarPacientes() {
    try {
      const response = await api.get("/api/pacientes/")

      const pacientesMapeados = response.data.map(p => ({
        id: p.id,
        nombres: p.nombres,
        apellidos: p.apellidos,
        fechaNacimiento: p.fecha_nacimiento,
        dni: p.dni,
        sexo: p.sexo,
        peso: String(p.peso),
        talla: String(p.talla),
        departamento: p.departamento ?? "—",
        evaluaciones: p.evaluaciones ?? 0,
        ultimoRiesgo: p.ultimo_riesgo ?? null,
        historialEvaluaciones: p.historialEvaluaciones ?? []
      }))

      setPacientesBackend(pacientesMapeados)
    } catch (error) {
      console.error("Error al cargar pacientes:", error)
    } finally {
      setCargandoPacientes(false)
    }
  }

  async function cargarPreguntas() {
  try {
    const response = await api.get("/api/preguntas/")
    setPreguntasBackend(response.data)
  } catch (error) {
    console.error("Error al cargar preguntas:", error)
  }
  }

  async function iniciarEvaluacionBackend() {
    if (!pacienteId) return

    if (modoContinuar && evaluacionId) {
      setIniciado(true)
      return
    }

    try {
      const response = await api.post("/api/evaluaciones/iniciar", {
        paciente_id: Number(pacienteId)
      })

      setEvaluacionId(response.data.id)
      setIniciado(true)
    } catch (error) {
      console.error("Error al iniciar evaluación:", error)
      alert("No se pudo iniciar la evaluación.")
    }
}

  function actualizarRespuesta(campo, valor) {
    let valorFinal = valor

    if (campo === "valorHemoglobina" && typeof valorFinal === "string") {
      valorFinal = valorFinal.replace(",", ".")
    }

    setRespuestas(prev => {
      const nuevas = {
        ...prev,
        [campo]: valorFinal,
      }

      if (campo === "recibeHierro" && valorFinal !== "si") {
        nuevas.tomaDiario = ""
      }

      if (campo === "hemoglobinaMedida" && valorFinal !== "si") {
        nuevas.valorHemoglobina = ""
        nuevas.fechaPrueba = ""
        nuevas.lugarPrueba = ""
      }

      return nuevas
    })

    setErrores(prev => ({
      ...prev,
      [campo]: "",
    }))
  }

  function mostrarError(campo, msg) {
    setErrores(prev => ({ ...prev, [campo]: msg }))
    setErroresVisibles(prev => ({ ...prev, [campo]: false }))
    setTimeout(() => setErroresVisibles(prev => ({ ...prev, [campo]: true })), 10)
  }

  function validarSeccion() {
    let valido = true

    seccion.preguntas.forEach(p => {
      if (p.dependeDe && respuestas[p.dependeDe] !== p.mostrarSi) {
        return
      }

      const val = respuestas[p.id]

      if (p.tipo === "booleano" || p.tipo === "opcion") {
        if (val === "") {
          mostrarError(p.id, "Selecciona una opción")
          valido = false
        }
      } else if (p.tipo === "numero") {
        if (val === "") {
          mostrarError(p.id, "Ingresa un valor")
          valido = false
        } else if (isNaN(val) || Number(val) < 0) {
          mostrarError(p.id, "Ingresa un número válido")
          valido = false
        }
      } else if (p.tipo === "decimal") {
        if (val === "") {
          mostrarError(p.id, "Ingresa un valor")
          valido = false
        } else if (isNaN(val) || Number(val) <= 0) {
          mostrarError(p.id, "Ingresa un valor decimal válido")
          valido = false
        }
      } else if (p.tipo === "decimal_hemoglobina") {
        const valNormalizado = String(val).replace(",", ".")

        if (val === "") {
          mostrarError(p.id, "Ingresa el valor de hemoglobina o selecciona que no lo recuerda")
          valido = false
        } else if (
          val !== "no_recuerda" &&
          (isNaN(valNormalizado) || Number(valNormalizado) <= 0)
        ) {
          mostrarError(p.id, "Ingresa un valor decimal válido")
          valido = false
        }
      } else if (p.tipo === "fecha") {
        if (!val) {
          mostrarError(p.id, "Selecciona una fecha")
          valido = false
        }
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

  async function handleFinalizar() {
    if (!validarSeccion()) return

    if (!evaluacionId) {
      alert("No se encontró una evaluación en progreso.")
      return
    }

    setCompletadas(prev => [...new Set([...prev, seccionActual])])

    try {
      const respuestasBackend = Object.entries(respuestas)
        .filter(([_, valor]) => valor !== "" && valor !== null && valor !== undefined)
        .map(([idFrontend, valor]) => {
          const codigoBackend = CODIGO_BACKEND[idFrontend]
          if (idFrontend === "tomaDiario" && respuestas.recibeHierro !== "si") {
            return null
          }

          if (
            ["valorHemoglobina", "fechaPrueba", "lugarPrueba"].includes(idFrontend) &&
            respuestas.hemoglobinaMedida !== "si"
          ) {
            return null
          }

          if (!codigoBackend) return null

          const preguntaBackend = preguntasBackend.find(
            p => p.codigo === codigoBackend
          )

          if (!preguntaBackend) return null

          let respuestaFinal = convertirRespuestaParaBackend(valor)
          
          return {
            pregunta_id: preguntaBackend.id,
            respuesta: String(respuestaFinal)
          }
        })
        .filter(Boolean)

      const response = await api.post(
        `/api/evaluaciones/${evaluacionId}/finalizar`,
        {
          respuestas: respuestasBackend
        }
      )

      console.log("Evaluación finalizada:", response.data)

      setResultadoBackend(response.data)
      setFinalizado(true)

    } catch (error) {
      console.error("Error al finalizar evaluación:", error)

      if (error.response?.data?.detail) {
        alert(error.response.data.detail)
      } else {
        alert("No se pudo finalizar la evaluación.")
      }
    }
  }

  function reiniciar() {
    setPacienteId("")
    setEvaluacionId(null)
    setResultadoBackend(null)
    setModoContinuar(false)
    setIniciado(false)
    setSeccionActual(0)
    setRespuestas(initRespuestas())
    setErrores({})
    setCompletadas([])
    setFinalizado(false)
  }

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"

  if (finalizado) {
    const paciente = pacientesLista.find(p => String(p.id) === pacienteId)
    const riesgoBackend = resultadoBackend?.nivel_riesgo ?? "bajo"
    const riesgo = String(riesgoBackend).toLowerCase().trim()
    const puntaje = Number(resultadoBackend?.puntaje_total) || 0
    const estado = resultadoBackend?.estado_evaluacion ?? "culminada"

    const badge = {
      bajo: "bg-green-50 text-green-700 border-green-200",
      moderado: "bg-amber-50 text-amber-700 border-amber-200",
      alto: "bg-red-50 text-red-700 border-red-200"
    }
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center flex-1 gap-4 py-12">
          <CheckCircle2 size={48} className="text-green-600" />
          <h1 className="text-xl font-bold text-slate-800">Evaluación completada</h1>
          <p className="text-xs text-slate-500">Paciente: <span className="font-medium text-slate-700">{paciente?.nombres} {paciente?.apellidos}</span></p>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${badge[riesgo] ?? badge.bajo}`}>
            Nivel de riesgo: {riesgo.charAt(0).toUpperCase() + riesgo.slice(1)}
          </div>

          <p className="text-xs text-slate-500">
            Puntaje total: <span className="font-medium text-slate-700">{puntaje}</span>
          </p>

          <p className="text-xs text-slate-500">
            Estado: <span className="font-medium text-slate-700">{estado}</span>
          </p>
          <div className="flex gap-3 mt-4">
            <button onClick={reiniciar} className="border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium px-6 py-2 rounded-lg transition-colors">
              Nueva evaluación
            </button>
            <button
              onClick={() =>
                navigate(`/doctor/pacientes/${pacienteId}`, {
                  state: {
                    tab: "evaluaciones",
                    evaluacionId: resultadoBackend?.id ?? evaluacionId,
                    abrirDetalle: true
                  }
                })
              }
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-6 py-2 rounded-lg transition-colors"
            >
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
          <h1 className="text-xl font-bold text-slate-800">
            {modoContinuar ? "Continuar evaluación" : "Iniciar evaluación"}
          </h1>
          <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-md space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Selecciona un paciente</label>
              {cargandoPacientes && (
                <p className="text-xs text-slate-400 mb-2">Cargando pacientes...</p>
              )}
              <SelectCustom
                placeholder="Buscar paciente..."
                value={pacienteId}
                onChange={setPacienteId}
                opciones={opcionesPacientes(pacientesLista)}
              />
            </div>
            <button
              onClick={iniciarEvaluacionBackend}
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
        <h1 className="text-xl font-bold text-slate-800">
          {modoContinuar ? "Continuar evaluación" : "Evaluación"}
        </h1>

        {/* Paciente */}
        {(() => {
          const paciente = pacientesLista.find(p => String(p.id) === pacienteId)
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
            const bloqueada = p.dependeDe && respuestas[p.dependeDe] !== p.mostrarSi
            return (
            <div key={p.id} className={bloqueada ? "opacity-40 pointer-events-none select-none" : ""}>
              <p className="text-xs font-medium text-slate-700 mb-2">{p.texto}</p>
              {p.tipo === "booleano" && (
                <div className="flex gap-2">
                  {opcionesDePregunta(p).map(op => (
                    <button
                      key={op.value}
                      onClick={() => actualizarRespuesta(p.id, op.value)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        respuestas[p.id] === op.value
                          ? "bg-slate-800 border-slate-800 text-white"
                          : "border-slate-300 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {op.label}
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
              {p.tipo === "decimal_hemoglobina" && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder={p.placeholder}
                    value={respuestas[p.id] === "no_recuerda" ? "" : respuestas[p.id]}
                    onChange={e => actualizarRespuesta(p.id, e.target.value)}
                    className={inputClass}
                    disabled={respuestas[p.id] === "no_recuerda"}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      actualizarRespuesta(
                        p.id,
                        respuestas[p.id] === "no_recuerda" ? "" : "no_recuerda"
                      )
                    }
                    className={`w-full py-2 text-xs font-medium rounded-lg border transition-colors ${
                      respuestas[p.id] === "no_recuerda"
                        ? "bg-slate-800 border-slate-800 text-white"
                        : "border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    No sabe / no recuerda
                  </button>
                </div>
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
                  onChange={v => actualizarRespuesta(p.id, v)}
                  opciones={opcionesDePregunta(p)}
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
