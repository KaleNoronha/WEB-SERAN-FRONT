import { useState } from "react"
import AppLayout from "../layouts/AppLayout"
import { usePacientes } from "../context/PacientesContext"
import SelectCustom from "../components/SelectCustom"

const departamentos = [
  "Puno", "Loreto", "Apurímac", "Madre de Dios"
].map(d => ({ value: d, label: d }))

const opcionesDias = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))
const opcionesMeses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
].map((m, i) => ({ value: String(i + 1), label: m }))
const anioActual = new Date().getFullYear()
const opcionesAnios = Array.from({ length: 6 }, (_, i) => ({ value: String(anioActual - i), label: String(anioActual - i) }))
const opcionesSexo = [{ value: "masculino", label: "Masculino" }, { value: "femenino", label: "Femenino" }]
const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/

export default function RegistroPaciente() {
  const { agregarPaciente } = usePacientes()

  const [form, setForm] = useState({ nombres: "", apellidos: "", dni: "", sexo: "", peso: "", talla: "", departamento: "" })
  const [dia, setDia] = useState("")
  const [mes, setMes] = useState("")
  const [anio, setAnio] = useState("")
  const [errores, setErrores] = useState({})
  const [erroresVisibles, setErroresVisibles] = useState({})
  const [exito, setExito] = useState(false)
  const [exitoVisible, setExitoVisible] = useState(false)

  function mostrarError(campo, msg) {
    setErrores(prev => ({ ...prev, [campo]: msg }))
    setErroresVisibles(prev => ({ ...prev, [campo]: false }))
    setTimeout(() => setErroresVisibles(prev => ({ ...prev, [campo]: true })), 10)
  }

  function limpiarError(campo) {
    setErrores(prev => ({ ...prev, [campo]: "" }))
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    limpiarError(name)
  }

  function validar() {
    let valido = true

    if (!form.nombres.trim()) { mostrarError("nombres", "Ingresa los nombres"); valido = false }
    else if (!soloLetras.test(form.nombres)) { mostrarError("nombres", "Solo se permiten letras"); valido = false }

    if (!form.apellidos.trim()) { mostrarError("apellidos", "Ingresa los apellidos"); valido = false }
    else if (!soloLetras.test(form.apellidos)) { mostrarError("apellidos", "Solo se permiten letras"); valido = false }

    if (!dia || !mes || !anio) { mostrarError("fecha", "Ingresa la fecha de nacimiento completa"); valido = false }
    else {
      const fechaStr = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
      const nacimiento = new Date(fechaStr)
      const hoy = new Date()
      const edadAnios = (hoy - nacimiento) / (1000 * 60 * 60 * 24 * 365.25)
      if (nacimiento > hoy) { mostrarError("fecha", "La fecha no puede ser futura"); valido = false }
      else if (edadAnios >= 5) { mostrarError("fecha", "El paciente debe ser menor de 5 años"); valido = false }
    }

    if (!form.dni.trim()) { mostrarError("dni", "Ingresa el DNI"); valido = false }
    else if (!/^\d{8}$/.test(form.dni)) { mostrarError("dni", "El DNI debe tener exactamente 8 dígitos numéricos"); valido = false }

    if (!form.sexo) { mostrarError("sexo", "Selecciona el sexo"); valido = false }

    if (!form.peso.trim()) { mostrarError("peso", "Ingresa el peso"); valido = false }
    else if (isNaN(form.peso) || Number(form.peso) <= 0) { mostrarError("peso", "Ingresa un peso válido"); valido = false }

    if (!form.talla.trim()) { mostrarError("talla", "Ingresa la talla"); valido = false }
    else if (isNaN(form.talla) || Number(form.talla) <= 0) { mostrarError("talla", "Ingresa una talla válida"); valido = false }

    if (!form.departamento) { mostrarError("departamento", "Selecciona el departamento"); valido = false }

    return valido
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validar()) return
    const fechaNacimiento = `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
    agregarPaciente({ ...form, fechaNacimiento })
    setForm({ nombres: "", apellidos: "", dni: "", sexo: "", peso: "", talla: "", departamento: "" })
    setDia(""); setMes(""); setAnio("")
    setExito(true)
    setExitoVisible(false)
    setTimeout(() => setExitoVisible(true), 10)
    setTimeout(() => { setExito(false); setExitoVisible(false) }, 4000)
  }

  function ErrorCampo({ campo }) {
    if (!errores[campo]) return null
    return (
      <p className={`text-red-700 text-xs mt-1 transition-opacity duration-500 ${erroresVisibles[campo] ? "opacity-100" : "opacity-0"}`}>
        {errores[campo]}
      </p>
    )
  }

  const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-500"

  return (
    <AppLayout>
      <div className="flex flex-col flex-1 space-y-4">
        <h1 className="text-base font-semibold text-slate-800">Registro de paciente</h1>

        {exito && (
          <p className={`text-xs px-3 py-2 rounded-lg border bg-green-50 text-green-700 border-green-200 transition-opacity duration-500 ${exitoVisible ? "opacity-100" : "opacity-0"}`}>
            Paciente registrado exitosamente.
          </p>
        )}

        <form id="formPaciente" onSubmit={handleSubmit} autoComplete="off" className="flex flex-col flex-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nombres <span className="text-red-500">*</span></label>
                <input name="nombres" type="text" placeholder="Ingresa los nombres" value={form.nombres} onChange={handleChange} className={inputClass} />
                <ErrorCampo campo="nombres" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Apellidos <span className="text-red-500">*</span></label>
                <input name="apellidos" type="text" placeholder="Ingresa los apellidos" value={form.apellidos} onChange={handleChange} className={inputClass} />
                <ErrorCampo campo="apellidos" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Fecha de nacimiento <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  <SelectCustom placeholder="Día" value={dia} onChange={v => { setDia(v); limpiarError("fecha") }} opciones={opcionesDias} />
                  <SelectCustom placeholder="Mes" value={mes} onChange={v => { setMes(v); limpiarError("fecha") }} opciones={opcionesMeses} />
                  <SelectCustom placeholder="Año" value={anio} onChange={v => { setAnio(v); limpiarError("fecha") }} opciones={opcionesAnios} />
                </div>
                <ErrorCampo campo="fecha" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">DNI <span className="text-red-500">*</span></label>
                <input name="dni" type="text" placeholder="Ingresa el DNI" value={form.dni} onChange={handleChange} maxLength={8} className={inputClass} />
                <ErrorCampo campo="dni" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Sexo <span className="text-red-500">*</span></label>
                <SelectCustom placeholder="Selecciona el sexo" value={form.sexo} onChange={v => { setForm(p => ({ ...p, sexo: v })); limpiarError("sexo") }} opciones={opcionesSexo} />
                <ErrorCampo campo="sexo" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Departamento <span className="text-red-500">*</span></label>
                <SelectCustom placeholder="Selecciona el departamento" value={form.departamento} onChange={v => { setForm(p => ({ ...p, departamento: v })); limpiarError("departamento") }} opciones={departamentos} />
                <ErrorCampo campo="departamento" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Peso (kg) <span className="text-red-500">*</span></label>
                <input name="peso" type="text" placeholder="Ej: 12.5" value={form.peso} onChange={handleChange} className={inputClass} />
                <ErrorCampo campo="peso" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Talla (cm) <span className="text-red-500">*</span></label>
                <input name="talla" type="text" placeholder="Ej: 85.0" value={form.talla} onChange={handleChange} className={inputClass} />
                <ErrorCampo campo="talla" />
              </div>
            </div>

          </div>

          <div className="flex justify-center">
            <button type="submit" className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-8 py-2 rounded-lg transition-colors">
              Registrar
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
