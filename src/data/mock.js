import { evaluarRespuestas, RECOMENDACIONES } from "../utils/evaluacionEngine"

export const usuarios = [
  { id: 1, nombre: "Admin", apellido: "Prueba", email: "admin.prueba@hospital.com", password: "Admin@1234", rol: "admin", estado: "activo", hospital: "Hospital Prueba" },
  { id: 2, nombre: "Doctor", apellido: "Prueba", email: "doctor.prueba@hospital.com", password: "Doctor@1234", rol: "doctor", estado: "activo", hospital: "Hospital Prueba", colegiatura: "CMP12345", fechaInvitacion: "01/01/2026", fechaRegistro: "05/01/2026" },
]

const respuestasLucia = {
  prematuro: "no", bajoPeso: "no", anemiaEmbarazo: "si",
  carneVisceras: "no", menestras: "no", carbohidratos: "si", alimentosDesde6m: "si", buenApetito: "no",
  recibeHierro: "no", tomaDiario: "no", asisteCred: "si", mesesUltimoControl: "8",
  palido: "si", cansancio: "si", perdidaApetito: "si",
  diarrea: "no", infecciones: "si", parasitos: "no", desparasitado: "si",
  aguaSegura: "no", bajoPesoEdad: "si", tallaEdad: "no", delgadez: "si", faltaComida: "si",
  hemoglobinaMedida: "si", valorHemoglobina: "10.2", fechaPrueba: "2026-03-15", lugarPrueba: "posta",
}

const respuestasCarlos = {
  prematuro: "no", bajoPeso: "no", anemiaEmbarazo: "no",
  carneVisceras: "si", menestras: "si", carbohidratos: "no", alimentosDesde6m: "si", buenApetito: "si",
  recibeHierro: "si", tomaDiario: "si", asisteCred: "si", mesesUltimoControl: "2",
  palido: "no", cansancio: "no", perdidaApetito: "no",
  diarrea: "no", infecciones: "no", parasitos: "no", desparasitado: "si",
  aguaSegura: "si", bajoPesoEdad: "no", tallaEdad: "no", delgadez: "no", faltaComida: "no",
  hemoglobinaMedida: "si", valorHemoglobina: "11.8", fechaPrueba: "2026-04-10", lugarPrueba: "hospital",
}

const configDefault = { alimentacion: true, suplementacion: true, controles: true, higiene: false, estimulacion: false, derivacion: true }

function generarEval(respuestas, fecha) {
  const { reglasEvaluadas, total, nivel } = evaluarRespuestas(respuestas)
  const recomendaciones = Object.entries(RECOMENDACIONES[nivel])
    .filter(([cat]) => configDefault[cat])
    .map(([cat, texto]) => ({ categoria: cat, texto }))
  return { fecha, riesgo: nivel, respuestas, reglasEvaluadas, total, recomendaciones }
}

export const pacientes = [
  { id: 1, nombres: "Lucía", apellidos: "Quispe Mamani", fechaNacimiento: "2023-05-10", dni: "12345678", sexo: "femenino", peso: 12.5, talla: 88, departamento: "Puno", evaluaciones: 1, ultimoRiesgo: "alto", historialEvaluaciones: [generarEval(respuestasLucia, "10/04/2026")] },
  { id: 2, nombres: "Carlos", apellidos: "Huanca Flores", fechaNacimiento: "2024-05-10", dni: "87654321", sexo: "masculino", peso: 11.8, talla: 84, departamento: "Loreto", evaluaciones: 1, ultimoRiesgo: "bajo", historialEvaluaciones: [generarEval(respuestasCarlos, "15/04/2026")] },
]
