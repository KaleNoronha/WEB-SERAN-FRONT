import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ChevronLeft, Pencil, ChevronRight } from "lucide-react"
import AppLayout from "../layouts/AppLayout"
import { usePacientes } from "../context/PacientesContext"
import SelectCustom from "../components/SelectCustom"
import { CATEGORIAS_RECOMENDACIONES } from "../context/RecomendacionesContext"
import api from "../api/api"

function calcularMeses(fechaNacimiento) {
  const hoy = new Date()
  const nac = new Date(fechaNacimiento)
  let meses = (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth())
  if (hoy.getDate() < nac.getDate()) meses--
  meses = Math.max(0, meses)
  return Math.floor(meses / 12) * 12
}

const estadoBadge = {
  culminada: "bg-green-50 text-green-700",
  "en progreso": "bg-amber-50 text-amber-700",
  en_progreso: "bg-amber-50 text-amber-700",
  cancelada: "bg-slate-100 text-slate-500",
}
const riesgoBadge = { alto: "bg-red-50 text-red-700", moderado: "bg-amber-50 text-amber-700", bajo: "bg-green-50 text-green-700" }
const departamentos = ["Puno", "Loreto", "Apurímac", "Madre de Dios"].map(d => ({ value: d, label: d }))
const opcionesSexo = [{ value: "masculino", label: "Masculino" }, { value: "femenino", label: "Femenino" }]
const anioActual = new Date().getFullYear()
const opcionesDias = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
const opcionesMeses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"].map((m, i) => ({ value: String(i + 1), label: m }))
const opcionesAnios = Array.from({ length: 6 }, (_, i) => ({ value: String(anioActual - i), label: String(anioActual - i) }))
const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"
const inputReadClass = "w-full border border-slate-200 rounded-lg px-3 py-2 text-xs bg-slate-50 text-slate-400 cursor-not-allowed"

function Campo({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-xs text-slate-800 mt-0.5">{value ?? "—"}</p>
    </div>
  )
}

function DetalleEvaluacion({ ev }) {
  const [colapsadas, setColapsadas] = useState({})

  const riesgoSeguro = ev.riesgo ?? "sin_resultado"
  const riesgoTexto = riesgoSeguro === "sin_resultado"
    ? "Sin resultado"
    : riesgoSeguro.charAt(0).toUpperCase() + riesgoSeguro.slice(1)

  const secciones = [...new Set((ev.reglasEvaluadas ?? []).map(r => r.seccion))]
  function toggle(key) { setColapsadas(prev => ({ ...prev, [key]: !prev[key] })) }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <p className="text-xs text-slate-400 mb-0.5">Fecha de evaluación</p>
            <p className="text-sm font-semibold text-slate-800">{ev.fecha}</p>
          </div>
          <div className="flex-1 text-center border-x border-slate-100 px-6">
            <p className="text-xs text-slate-400 mb-1">Puntaje total</p>
            <p className="text-4xl font-bold text-slate-800">{ev.total ?? "—"}</p>
          
          </div>
          <div className="flex-1 flex flex-col items-end gap-2">
            <p className="text-xs text-slate-400">Nivel de riesgo</p>
            <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${
              riesgoSeguro === "alto" ? "bg-red-50 text-red-700 border-red-200" :
              riesgoSeguro === "moderado" ? "bg-amber-50 text-amber-700 border-amber-200" :
              riesgoSeguro === "bajo" ? "bg-green-50 text-green-700 border-green-200" :
              "bg-slate-100 text-slate-500 border-slate-200"
            }`}>
              {riesgoTexto}
            </span>
          </div>
        </div>
      </div>

      {ev.recomendaciones && ev.recomendaciones.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button onClick={() => toggle("__recs")} className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors">
            <p className="text-xs font-semibold text-slate-700">Recomendaciones</p>
            <ChevronRight size={14} className={`text-slate-400 transition-transform ${colapsadas["__recs"] ? "" : "rotate-90"}`} />
          </button>
          {!colapsadas["__recs"] && (
            <div className="divide-y divide-slate-100">
              {ev.recomendaciones.map((rec, index) => {
                const cat = CATEGORIAS_RECOMENDACIONES.find(c => c.id === rec.categoria)

                const categoria =
                  cat?.label ??
                  rec.categoria?.replaceAll("_", " ") ??
                  "General"

                return (
                  <div key={`${rec.categoria}-${rec.id ?? index}`} className="px-5 py-4">
                    <p className="text-xs font-semibold text-slate-700 capitalize">
                      {categoria}
                    </p>

                    {rec.titulo && (
                      <p className="text-xs font-medium text-slate-600 mt-1">
                        {rec.titulo}
                      </p>
                    )}

                    <p className="text-xs text-slate-500 mt-0.5">
                      {rec.texto}
                    </p>

                    {rec.tipo_recomendacion && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Aplica para: {rec.tipo_recomendacion}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {ev.explicaciones && ev.explicaciones.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => toggle("__explicaciones")}
            className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <p className="text-xs font-semibold text-slate-700">Explicaciones del motor de reglas</p>
            <ChevronRight size={14} className={`text-slate-400 transition-transform ${colapsadas["__explicaciones"] ? "" : "rotate-90"}`} />
          </button>

          {!colapsadas["__explicaciones"] && (
            <div className="divide-y divide-slate-100">
              {ev.explicaciones.map((exp, i) => (
                <div key={i} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{exp.tipo}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{exp.descripcion}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      +{exp.puntaje}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {secciones.map(sec => (
        <div key={sec} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button onClick={() => toggle(sec)} className="w-full flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors">
            <p className="text-xs font-semibold text-slate-700">{sec}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">{(ev.reglasEvaluadas ?? []).filter(r => r.seccion === sec && r.activada).length} regla(s) activada(s)</span>
              <ChevronRight size={14} className={`text-slate-400 transition-transform ${colapsadas[sec] ? "" : "rotate-90"}`} />
            </div>
          </button>
          {!colapsadas[sec] && (
            <table className="w-full text-xs">
              <thead className="border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-2.5 font-medium text-slate-500 w-1/4">Pregunta</th>
                  <th className="text-left px-5 py-2.5 font-medium text-slate-500 w-16">Respuesta</th>
                  <th className="text-left px-5 py-2.5 font-medium text-slate-500">¿Por qué suma puntos?</th>
                  <th className="text-center px-5 py-2.5 font-medium text-slate-500">Regla activada</th>
                  <th className="text-center px-5 py-2.5 font-medium text-slate-500">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(ev.reglasEvaluadas ?? []).filter(r => r.seccion === sec).map(r => {
                  const respuesta = r.respuesta ?? ev.respuestas?.[r.id]
                  const respuestaLabel =
                    respuesta === "si" || respuesta === "Si" ? "Sí" :
                    respuesta === "no" || respuesta === "No" ? "No" :
                    respuesta ?? "—"
                  return (
                    <tr key={r.id} className={r.activada ? "bg-red-50/40" : ""}>
                      <td className="px-5 py-3 text-slate-700 font-medium">{r.pregunta}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{respuestaLabel}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {r.activada ? r.descripcion : <span className="text-slate-300">No aplica — respuesta no genera riesgo.</span>}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.activada ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {r.activada ? "Sí" : "No"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center font-bold text-slate-800">{r.puntosObtenidos}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  )
}

export default function DetallePaciente() {
  const { id } = useParams()
  const { pacientes, setPacientes } = usePacientes()
  const navigate = useNavigate()

  const [pacienteBackend, setPacienteBackend] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [evaluacionesBackend, setEvaluacionesBackend] = useState([])
  const [cargandoEvaluaciones, setCargandoEvaluaciones] = useState(true)
  const [detalleEvaluacionBackend, setDetalleEvaluacionBackend] = useState(null)
  const [cargandoDetalleEvaluacion, setCargandoDetalleEvaluacion] = useState(false)
  const location = useLocation()
  const [tab, setTab] = useState(location.state?.tab ?? "datos")
  const [evalIdx, setEvalIdx] = useState(location.state?.evalIdx ?? null)
  const [evaluacionSeleccionadaId, setEvaluacionSeleccionadaId] = useState(
    location.state?.evaluacionId ?? null
  )
  const [editando, setEditando] = useState(false)
  const [exito, setExito] = useState(false)
  const [exitoVisible, setExitoVisible] = useState(false)
  const [errores, setErrores] = useState({})
  const [erroresVisibles, setErroresVisibles] = useState({})

  const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/
  const pacienteLocal = pacientes.find(p => String(p.id) === id)
  const paciente = pacienteBackend ?? pacienteLocal
  const fechaParts = paciente?.fechaNacimiento?.split("-") ?? ["", "", ""]

  const [form, setForm] = useState({
    nombres: paciente?.nombres ?? "",
    apellidos: paciente?.apellidos ?? "",
    dni: paciente?.dni ?? "",
    sexo: paciente?.sexo ?? "",
    peso: String(paciente?.peso ?? ""),
    talla: String(paciente?.talla ?? ""),
    departamento: paciente?.departamento ?? "",
  })
  const [dia, setDia] = useState(fechaParts[2] ? String(parseInt(fechaParts[2])) : "")
  const [mes, setMes] = useState(fechaParts[1] ? String(parseInt(fechaParts[1])) : "")
  const [anio, setAnio] = useState(fechaParts[0] ?? "")
  const [formSnap, setFormSnap] = useState(form)
  const [diaSnap, setDiaSnap] = useState(dia)
  const [mesSnap, setMesSnap] = useState(mes)
  const [anioSnap, setAnioSnap] = useState(anio)

  const historialEvaluaciones = evaluacionesBackend.length > 0
  ? evaluacionesBackend
  : paciente?.historialEvaluaciones ?? []

  const evaluacionSeleccionada = evaluacionSeleccionadaId
    ? historialEvaluaciones.find(ev => String(ev.id) === String(evaluacionSeleccionadaId))
    : evalIdx !== null
      ? historialEvaluaciones[evalIdx]
      : null

  const evaluacionParaMostrar = detalleEvaluacionBackend ?? evaluacionSeleccionada

  useEffect(() => {
    if (!location.state?.evaluacionId) return
    if (historialEvaluaciones.length === 0) return

    const index = historialEvaluaciones.findIndex(
      ev => String(ev.id) === String(location.state.evaluacionId)
    )

    if (index !== -1) {
      setEvalIdx(index)
      setEvaluacionSeleccionadaId(location.state.evaluacionId)
      cargarDetalleEvaluacion(location.state.evaluacionId)

      if (location.state.abrirDetalle) {
        setTab("detalle")
      }
    }
  }, [location.state, historialEvaluaciones.length])

useEffect(() => {
  if (!paciente) return

  const partesFecha = paciente.fechaNacimiento?.split("-") ?? ["", "", ""]

  const nuevoForm = {
    nombres: paciente.nombres ?? "",
    apellidos: paciente.apellidos ?? "",
    dni: paciente.dni ?? "",
    sexo: paciente.sexo ?? "",
    peso: String(paciente.peso ?? ""),
    talla: String(paciente.talla ?? ""),
    departamento: paciente.departamento ?? "—",
  }

  const nuevoDia = partesFecha[2] ? String(parseInt(partesFecha[2])) : ""
  const nuevoMes = partesFecha[1] ? String(parseInt(partesFecha[1])) : ""
  const nuevoAnio = partesFecha[0] ?? ""

  setForm(nuevoForm)
  setDia(nuevoDia)
  setMes(nuevoMes)
  setAnio(nuevoAnio)

  setFormSnap(nuevoForm)
  setDiaSnap(nuevoDia)
  setMesSnap(nuevoMes)
  setAnioSnap(nuevoAnio)
}, [pacienteBackend])

useEffect(() => {
  cargarPaciente()
  cargarEvaluacionesPaciente()
}, [id])


async function cargarPaciente() {
  try {
    const response = await api.get(`/api/pacientes/${id}`)

    const p = response.data

    setPacienteBackend({
      id: p.id,
      nombres: p.nombres,
      apellidos: p.apellidos,
      dni: p.dni,
      sexo: p.sexo,
      peso: String(p.peso),
      talla: String(p.talla),
      fechaNacimiento: p.fecha_nacimiento,
      departamento: p.departamento ?? "—",
      evaluaciones: p.evaluaciones ?? 0,
      ultimoRiesgo: p.ultimo_riesgo ?? null,
      historialEvaluaciones: p.historialEvaluaciones ?? []
    })
  } catch (error) {
    setPacienteBackend(null)
  } finally {
    setCargando(false)
  }
}

async function cargarEvaluacionesPaciente() {
  try {
    const response = await api.get(`/api/evaluaciones/paciente/${id}`)

    const evaluacionesMapeadas = response.data.map(ev => {
      const estado = String(ev.estado_evaluacion ?? "")
        .toLowerCase()
        .trim()
        .replace(" ", "_")

      let riesgo = null
      if (estado === "culminada" && ev.nivel_riesgo) {
        riesgo = String(ev.nivel_riesgo).toLowerCase().trim()
      }

      return {
        id: ev.id,
        fecha: ev.fecha_evaluacion,
        total: ev.puntaje_total,
        riesgo,
        estado,
        recomendaciones: [],
        reglasEvaluadas: [],
        respuestas: {}
      }
    })

    setEvaluacionesBackend(evaluacionesMapeadas)
  } catch (error) {
    console.error("Error al cargar evaluaciones:", error)
    setEvaluacionesBackend([])
  } finally {
    setCargandoEvaluaciones(false)
  }
}

async function cargarDetalleEvaluacion(evaluacionId) {
  if (!evaluacionId) return

  try {
    setCargandoDetalleEvaluacion(true)

    const response = await api.get(`/api/evaluaciones/${evaluacionId}`)
    const ev = response.data

    const detalleMapeado = {
      id: ev.evaluacion_id,
      fecha: ev.fecha_evaluacion,
      total: ev.puntaje_total,
      riesgo: String(ev.nivel_riesgo ?? "bajo").toLowerCase().trim(),
      estado: ev.estado_evaluacion,
      respuestasEvaluadas: ev.respuestas_evaluadas ?? [],
      explicaciones: ev.explicaciones ?? [],
      recomendaciones: (ev.recomendaciones ?? []).map((rec, index) => ({
        id: rec.id ?? index,
        titulo: rec.titulo ?? rec.categoria ?? `Recomendación ${index + 1}`,
        tipo_recomendacion: rec.tipo_recomendacion ?? rec.tipo ?? ev.nivel_riesgo,
        categoria: rec.categoria ?? "general",
        texto: rec.texto ?? rec.descripcion ?? ""
      })),
      reglasEvaluadas: (ev.respuestas_evaluadas ?? []).map(r => ({
        id: r.codigo,
        seccion: "Evaluación",
        pregunta: r.texto_pregunta,
        respuesta: r.respuesta,
        descripcion: `Respuesta registrada: ${r.respuesta}`,
        activada: Number(r.puntaje_obtenido) > 0,
        puntosObtenidos: r.puntaje_obtenido,
        puntos: r.puntaje_obtenido,
      }))
    }

    setDetalleEvaluacionBackend(detalleMapeado)
  } catch (error) {
    console.error("Error al cargar detalle de evaluación:", error)
    setDetalleEvaluacionBackend(null)
  } finally {
    setCargandoDetalleEvaluacion(false)
  }
}

function continuarEvaluacion(evaluacionId) {
  navigate(`/doctor/evaluacion`, {
    state: {
      evaluacionId,
      pacienteId: paciente.id,
      modo: "continuar"
    }
  })
}

  if (cargando) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center flex-1 text-slate-400 text-xs">
        Cargando paciente...
      </div>
    </AppLayout>
  )

  if (!paciente) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center flex-1 text-slate-400 text-xs">
        Paciente no encontrado.
      </div>
    </AppLayout>
  )

  function mostrarError(campo, msg) {
    setErrores(prev => ({ ...prev, [campo]: msg }))
    setErroresVisibles(prev => ({ ...prev, [campo]: false }))
    setTimeout(() => setErroresVisibles(prev => ({ ...prev, [campo]: true })), 10)
  }

  function ErrorCampo({ campo }) {
    if (!errores[campo]) return null
    return <p className={`text-red-700 text-xs mt-1 transition-opacity duration-500 ${erroresVisibles[campo] ? "opacity-100" : "opacity-0"}`}>{errores[campo]}</p>
  }

  function handleEditar() {
    setFormSnap(form); setDiaSnap(dia); setMesSnap(mes); setAnioSnap(anio)
    setEditando(true)
  }

  function handleCancelar() {
    setForm(formSnap); setDia(diaSnap); setMes(mesSnap); setAnio(anioSnap)
    setErrores({})
    setEditando(false)
  }

  async function handleGuardar() {
    let valido = true
    const nuevoErrores = {}
    if (!form.nombres.trim()) { nuevoErrores.nombres = "Ingresa los nombres"; valido = false }
    else if (!soloLetras.test(form.nombres)) { nuevoErrores.nombres = "Solo se permiten letras"; valido = false }
    if (!form.apellidos.trim()) { nuevoErrores.apellidos = "Ingresa los apellidos"; valido = false }
    else if (!soloLetras.test(form.apellidos)) { nuevoErrores.apellidos = "Solo se permiten letras"; valido = false }
    if (!form.dni.trim()) { nuevoErrores.dni = "Ingresa el DNI"; valido = false }
    else if (!/^\d{8}$/.test(form.dni)) { nuevoErrores.dni = "El DNI debe tener 8 dígitos"; valido = false }
    if (!dia || !mes || !anio) { nuevoErrores.fecha = "Ingresa la fecha completa"; valido = false }
    else {
      const fechaStr = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
      const nacimiento = new Date(fechaStr)
      const hoy = new Date()
      const edadAnios = (hoy - nacimiento) / (1000 * 60 * 60 * 24 * 365.25)
      if (nacimiento > hoy) { nuevoErrores.fecha = "La fecha no puede ser futura"; valido = false }
      else if (edadAnios >= 5) { nuevoErrores.fecha = "El paciente debe ser menor de 5 años"; valido = false }
    }
    if (!form.sexo) { nuevoErrores.sexo = "Selecciona el sexo"; valido = false }
    if (!form.peso.toString().trim()) { nuevoErrores.peso = "Ingresa el peso"; valido = false }
    else if (isNaN(form.peso) || Number(form.peso) <= 0) { nuevoErrores.peso = "Ingresa un peso válido"; valido = false }
    if (!form.talla.toString().trim()) { nuevoErrores.talla = "Ingresa la talla"; valido = false }
    else if (isNaN(form.talla) || Number(form.talla) <= 0) { nuevoErrores.talla = "Ingresa una talla válida"; valido = false }
    if (!valido) { Object.keys(nuevoErrores).forEach(k => mostrarError(k, nuevoErrores[k])); return }
      const fechaNacimiento = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`

    try {
      const response = await api.put(`/api/pacientes/${id}`, {
        nombres: form.nombres,
        apellidos: form.apellidos,
        fecha_nacimiento: fechaNacimiento,
        dni: form.dni,
        sexo: form.sexo,
        peso: Number(form.peso),
        talla: Number(form.talla)
      })

      const p = response.data

      const pacienteActualizado = {
        id: p.id,
        nombres: p.nombres,
        apellidos: p.apellidos,
        dni: p.dni,
        sexo: p.sexo,
        peso: String(p.peso),
        talla: String(p.talla),
        fechaNacimiento: p.fecha_nacimiento,
        departamento: form.departamento || "—",
        evaluaciones: paciente.evaluaciones ?? 0,
        ultimoRiesgo: paciente.ultimoRiesgo ?? null,
        historialEvaluaciones: paciente.historialEvaluaciones ?? []
      }

      setPacienteBackend(pacienteActualizado)

      setPacientes(prev =>
        prev.map(pac => String(pac.id) === id ? pacienteActualizado : pac)
      )

      setEditando(false)
      setErrores({})
      setExito(true)
      setExitoVisible(false)

      setTimeout(() => setExitoVisible(true), 10)
      setTimeout(() => {
        setExito(false)
        setExitoVisible(false)
      }, 3000)

    } catch (error) {
      if (error.response?.data?.detail) {
        mostrarError("general", error.response.data.detail)
      } else {
        mostrarError("general", "No se pudieron guardar los cambios")
      }
    }
  }

  const modificado = 
    form.nombres !== formSnap.nombres ||
    form.apellidos !== formSnap.apellidos ||
    form.dni !== formSnap.dni ||
    form.sexo !== formSnap.sexo ||
    form.peso !== formSnap.peso ||
    form.talla !== formSnap.talla ||
    form.departamento !== formSnap.departamento ||
    dia !== diaSnap || mes !== mesSnap || anio !== anioSnap

  const fechaNacimientoActual = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`

  return (
    <AppLayout>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/doctor/pacientes")} className="text-slate-400 hover:text-slate-700 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-slate-800">{paciente.nombres} {paciente.apellidos}</h1>
        </div>

        <div className="flex items-center gap-1 border-b border-slate-200">
          {[["datos", "Datos"], ["evaluaciones", "Historial de evaluaciones"], ...(evalIdx !== null ? [["detalle", "Detalle de evaluación"]] : [])].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                tab === key ? "border-slate-800 text-slate-800" : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "datos" && (
          <div className="space-y-4">
            {exito && (
              <p className={`text-xs px-3 py-2 rounded-lg border bg-green-50 text-green-700 border-green-200 transition-opacity duration-500 ${exitoVisible ? "opacity-100" : "opacity-0"}`}>
                Cambios guardados correctamente.
              </p>
            )}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Datos personales</p>
                {editando ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Nombres</label>
                      <input name="nombres" value={form.nombres} onChange={e => setForm(p => ({ ...p, nombres: e.target.value }))} className={inputClass} />
                      <ErrorCampo campo="nombres" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Apellidos</label>
                      <input name="apellidos" value={form.apellidos} onChange={e => setForm(p => ({ ...p, apellidos: e.target.value }))} className={inputClass} />
                      <ErrorCampo campo="apellidos" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">DNI</label>
                      <input name="dni" value={form.dni} onChange={e => setForm(p => ({ ...p, dni: e.target.value }))} maxLength={8} className={inputClass} />
                      <ErrorCampo campo="dni" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Fecha de nacimiento</label>
                      <div className="grid grid-cols-3 gap-2">
                        <SelectCustom placeholder="Día" value={dia} onChange={setDia} opciones={opcionesDias} />
                        <SelectCustom placeholder="Mes" value={mes} onChange={setMes} opciones={opcionesMeses} />
                        <SelectCustom placeholder="Año" value={anio} onChange={setAnio} opciones={opcionesAnios} />
                      </div>
                      <ErrorCampo campo="fecha" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Edad (meses)</label>
                      <input value={calcularMeses(fechaNacimientoActual)} readOnly className={inputReadClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Sexo</label>
                      <SelectCustom placeholder="Selecciona" value={form.sexo} onChange={v => setForm(p => ({ ...p, sexo: v }))} opciones={opcionesSexo} />
                      <ErrorCampo campo="sexo" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    <Campo label="Nombres" value={form.nombres} />
                    <Campo label="Apellidos" value={form.apellidos} />
                    <Campo label="DNI" value={form.dni} />
                    <Campo label="Fecha de nacimiento" value={paciente.fechaNacimiento} />
                    <Campo label="Edad (meses)" value={calcularMeses(paciente.fechaNacimiento)} />
                    <Campo label="Sexo" value={form.sexo?.charAt(0).toUpperCase() + form.sexo?.slice(1)} />
                  </div>
                )}
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Datos clínicos</p>
                {editando ? (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Peso (kg)</label>
                      <input name="peso" value={form.peso} onChange={e => setForm(p => ({ ...p, peso: e.target.value }))} className={inputClass} />
                      <ErrorCampo campo="peso" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Talla (cm)</label>
                      <input name="talla" value={form.talla} onChange={e => setForm(p => ({ ...p, talla: e.target.value }))} className={inputClass} />
                      <ErrorCampo campo="talla" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Departamento</label>
                      <input value={form.departamento || "—"} readOnly className={inputReadClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Nivel de riesgo</label>
                      {paciente.ultimoRiesgo ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${riesgoBadge[paciente.ultimoRiesgo]}`}>
                          {paciente.ultimoRiesgo.charAt(0).toUpperCase() + paciente.ultimoRiesgo.slice(1)}
                        </span>
                      ) : <p className="text-xs text-slate-300">—</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Evaluaciones</label>
                      <input value={paciente.evaluaciones ?? 0} readOnly className={inputReadClass} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    <Campo label="Peso (kg)" value={form.peso} />
                    <Campo label="Talla (cm)" value={form.talla} />
                    <Campo label="Departamento" value={form.departamento} />
                    <div>
                      <p className="text-xs text-slate-400">Nivel de riesgo</p>
                      {paciente.ultimoRiesgo ? (
                        <span className={`mt-0.5 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${riesgoBadge[paciente.ultimoRiesgo]}`}>
                          {paciente.ultimoRiesgo.charAt(0).toUpperCase() + paciente.ultimoRiesgo.slice(1)}
                        </span>
                      ) : <p className="text-xs text-slate-300 mt-0.5">—</p>}
                    </div>
                    <Campo label="Evaluaciones" value={paciente.evaluaciones ?? 0} />
                  </div>
                )}
              </div>
            </div>
            {errores.general && (
              <p className={`text-red-700 text-xs mt-1 transition-opacity duration-500 ${erroresVisibles.general ? "opacity-100" : "opacity-0"}`}>
                {errores.general}
              </p>
            )}
            {editando ? (
              <div className="flex gap-3 justify-end">
                <button onClick={handleCancelar} className="text-xs text-slate-600 hover:text-slate-800 px-4 py-2">Cancelar</button>
                <button onClick={handleGuardar} disabled={!modificado} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Guardar cambios</button>
              </div>
            ) : (
              <div className="flex justify-end">
                <button onClick={handleEditar} className="flex items-center gap-2 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium px-4 py-2 rounded-lg transition-colors">
                  <Pencil size={12} /> Editar datos
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "evaluaciones" && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {cargandoEvaluaciones ? (
              <div className="px-4 py-10 text-center text-slate-400 text-xs">
                Cargando evaluaciones...
              </div>
            ) : historialEvaluaciones.length === 0 ? (
              <div className="px-4 py-10 text-center text-slate-400 text-xs">No hay evaluaciones registradas.</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">#</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Fecha</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Puntaje</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Nivel de riesgo</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Recomendaciones</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historialEvaluaciones.map((ev, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50 group"
                    >
                      <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3 text-slate-600">{ev.fecha}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[ev.estado] ?? "bg-slate-100 text-slate-500"}`}>
                          {ev.estado === "en_progreso"
                            ? "En progreso"
                            : ev.estado === "culminada"
                            ? "Culminada"
                            : ev.estado === "cancelada"
                            ? "Cancelada"
                            : ev.estado}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-800 font-medium">
                        {ev.estado === "culminada" ? (ev.total ?? "—") : "—"}
                      </td>

                      <td className="px-4 py-3">
                        {ev.estado === "culminada" && ev.riesgo ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${riesgoBadge[ev.riesgo]}`}>
                            {ev.riesgo.charAt(0).toUpperCase() + ev.riesgo.slice(1)}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {ev.estado === "culminada" ? (
                          ev.recomendaciones?.length > 0
                            ? <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Sí</span>
                            : <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-400">No</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {["en_progreso", "en progreso"].includes(ev.estado) ? (
                          <button
                            onClick={() => continuarEvaluacion(ev.id)}
                            className="text-amber-700 hover:underline text-xs font-medium"
                          >
                            Continuar
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEvalIdx(i)
                              setEvaluacionSeleccionadaId(ev.id)
                              cargarDetalleEvaluacion(ev.id)
                              setTab("detalle")
                            }}
                            className="text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "detalle" && cargandoDetalleEvaluacion && (
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-10 text-center text-slate-400 text-xs">
            Cargando detalle de evaluación...
          </div>
        )}

        {tab === "detalle" && !cargandoDetalleEvaluacion && evaluacionParaMostrar && (
          <DetalleEvaluacion ev={evaluacionParaMostrar} />
        )}    

      </div>
    </AppLayout>
  )
}
