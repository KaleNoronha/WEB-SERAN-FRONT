export const REGLAS = [
  { id: "prematuro",          seccion: "Antecedentes al nacer",       pregunta: "¿El niño nació prematuro?",                         condicion: r => r.prematuro === "si",                                              puntos: 1, descripcion: "El nacimiento prematuro aumenta el riesgo de reservas bajas de hierro." },
  { id: "bajoPeso",           seccion: "Antecedentes al nacer",       pregunta: "¿Nació con bajo peso (<2.5 kg)?",                   condicion: r => r.bajoPeso === "si",                                               puntos: 1, descripcion: "El bajo peso al nacer se asocia a menores reservas de hierro." },
  { id: "anemiaEmbarazo",     seccion: "Antecedentes al nacer",       pregunta: "¿La madre tuvo anemia durante el embarazo?",        condicion: r => r.anemiaEmbarazo === "si",                                         puntos: 1, descripcion: "La anemia materna reduce la transferencia de hierro al feto." },
  { id: "carneVisceras",      seccion: "Alimentación y Nutrición",    pregunta: "¿Consume sangrecita, hígado, bazo o carne?",        condicion: r => r.carneVisceras === "no",                                          puntos: 1, descripcion: "La ausencia de alimentos ricos en hierro hem aumenta el riesgo de deficiencia." },
  { id: "menestras",          seccion: "Alimentación y Nutrición",    pregunta: "¿Come menestras (lentejas, frejoles)?",             condicion: r => r.menestras === "no",                                              puntos: 1, descripcion: "Las menestras son fuente de hierro no hem; su ausencia reduce el aporte." },
  { id: "carbohidratos",      seccion: "Alimentación y Nutrición",    pregunta: "¿Come principalmente arroz, papa o fideos?",        condicion: r => r.carbohidratos === "si",                                          puntos: 1, descripcion: "Dieta basada en carbohidratos desplaza alimentos ricos en hierro." },
  { id: "alimentosDesde6m",   seccion: "Alimentación y Nutrición",    pregunta: "¿Inició alimentación complementaria desde los 6m?", condicion: r => r.alimentosDesde6m === "no",                                       puntos: 1, descripcion: "El retraso en la alimentación complementaria limita el aporte de hierro." },
  { id: "buenApetito",        seccion: "Alimentación y Nutrición",    pregunta: "¿Tiene buen apetito actualmente?",                  condicion: r => r.buenApetito === "no",                                            puntos: 1, descripcion: "La falta de apetito puede indicar deficiencia nutricional o anemia." },
  { id: "recibeHierro",       seccion: "Suplementación y Controles",  pregunta: "¿Recibe hierro o micronutrientes?",                 condicion: r => r.recibeHierro === "no",                                           puntos: 1, descripcion: "La falta de suplementación aumenta el riesgo de deficiencia de hierro." },
  { id: "tomaDiario",         seccion: "Suplementación y Controles",  pregunta: "¿Los toma todos los días?",                         condicion: r => r.tomaDiario === "no",                                             puntos: 1, descripcion: "La adherencia irregular reduce la efectividad de la suplementación." },
  { id: "asisteCred",         seccion: "Suplementación y Controles",  pregunta: "¿Asiste a controles de crecimiento y desarrollo?",  condicion: r => r.asisteCred === "no",                                             puntos: 1, descripcion: "La inasistencia a controles impide la detección temprana de anemia." },
  { id: "mesesUltimoControl", seccion: "Suplementación y Controles",  pregunta: "¿Último control hace más de 6 meses?",              condicion: r => Number(r.mesesUltimoControl) > 6,                                  puntos: 1, descripcion: "Un control tardío indica seguimiento insuficiente del estado nutricional." },
  { id: "palido",             seccion: "Síntomas",                    pregunta: "¿Se ve pálido (cara, labios o manos)?",             condicion: r => r.palido === "si",                                                 puntos: 1, descripcion: "La palidez es un signo clínico frecuente de anemia." },
  { id: "cansancio",          seccion: "Síntomas",                    pregunta: "¿Se cansa rápido o está decaído?",                  condicion: r => r.cansancio === "si",                                              puntos: 1, descripcion: "El cansancio y decaimiento reflejan reducción en el transporte de oxígeno." },
  { id: "perdidaApetito",     seccion: "Síntomas",                    pregunta: "¿Ha perdido el apetito?",                           condicion: r => r.perdidaApetito === "si",                                         puntos: 1, descripcion: "La pérdida de apetito es síntoma asociado a anemia ferropénica." },
  { id: "diarrea",            seccion: "Enfermedades recientes",      pregunta: "¿Ha tenido diarrea en las últimas semanas?",        condicion: r => r.diarrea === "si",                                                puntos: 1, descripcion: "La diarrea reduce la absorción de hierro y otros nutrientes." },
  { id: "infecciones",        seccion: "Enfermedades recientes",      pregunta: "¿Ha tenido tos o infecciones frecuentes?",          condicion: r => r.infecciones === "si",                                            puntos: 1, descripcion: "Las infecciones recurrentes aumentan el consumo de hierro." },
  { id: "parasitos",          seccion: "Enfermedades recientes",      pregunta: "¿Ha tenido parásitos?",                             condicion: r => r.parasitos === "si",                                              puntos: 1, descripcion: "Los parásitos intestinales compiten por el hierro y causan pérdidas." },
  { id: "desparasitado",      seccion: "Enfermedades recientes",      pregunta: "¿Ha sido desparasitado?",                           condicion: r => r.desparasitado === "no",                                          puntos: 1, descripcion: "La falta de desparasitación mantiene el riesgo de pérdida de hierro." },
  { id: "aguaSegura",         seccion: "Condiciones sanitarias",      pregunta: "¿El agua que consumen es segura?",                  condicion: r => r.aguaSegura === "no",                                             puntos: 1, descripcion: "El agua no tratada favorece infecciones que afectan la absorción de hierro." },
  { id: "bajoPesoEdad",       seccion: "Condiciones sanitarias",      pregunta: "¿Bajo peso para su edad?",                         condicion: r => r.bajoPesoEdad === "si",                                           puntos: 1, descripcion: "El bajo peso para la edad indica desnutrición crónica asociada a anemia." },
  { id: "tallaEdad",          seccion: "Condiciones sanitarias",      pregunta: "¿Talla baja para su edad?",                        condicion: r => r.tallaEdad === "si",                                              puntos: 1, descripcion: "La talla baja refleja desnutrición crónica que puede coexistir con anemia." },
  { id: "delgadez",           seccion: "Condiciones sanitarias",      pregunta: "¿Delgadez para su edad?",                          condicion: r => r.delgadez === "si",                                               puntos: 1, descripcion: "La delgadez indica déficit nutricional que agrava el riesgo de anemia." },
  { id: "faltaComida",        seccion: "Condiciones sanitarias",      pregunta: "¿En casa a veces falta comida?",                   condicion: r => r.faltaComida === "si",                                            puntos: 1, descripcion: "La inseguridad alimentaria es factor de riesgo directo de anemia." },
  { id: "valorHemoglobina",   seccion: "Pruebas médicas",             pregunta: "¿Hemoglobina menor a 11 g/dL?",                    condicion: r => Number(r.valorHemoglobina) > 0 && Number(r.valorHemoglobina) < 11, puntos: 2, descripcion: "Hemoglobina < 11 g/dL confirma anemia según criterios OMS para menores de 5 años." },
]

export const RECOMENDACIONES = {
  bajo: {
    alimentacion:   "Mantener una dieta variada con alimentos ricos en hierro como sangrecita, hígado e hígado de pollo al menos 3 veces por semana.",
    suplementacion: "Continuar con la suplementación preventiva de hierro y micronutrientes según indicación médica.",
    controles:      "Asistir a los controles de crecimiento y desarrollo cada 2 meses para monitorear el estado nutricional.",
    higiene:        "Mantener buenas prácticas de higiene: lavado de manos y consumo de agua hervida o tratada.",
    estimulacion:   "Fomentar actividades de estimulación temprana para apoyar el desarrollo cognitivo y motor.",
    derivacion:     "No se requiere derivación urgente. Continuar seguimiento en el establecimiento de salud.",
  },
  moderado: {
    alimentacion:   "Incrementar el consumo de alimentos ricos en hierro hem (sangrecita, hígado, carne) y combinarlos con vitamina C para mejorar la absorción.",
    suplementacion: "Reforzar la adherencia a la suplementación diaria de hierro y micronutrientes. Verificar que se tome correctamente.",
    controles:      "Programar control en el próximo mes para evaluar evolución nutricional y ajustar tratamiento.",
    higiene:        "Verificar acceso a agua segura y reforzar medidas de saneamiento en el hogar.",
    estimulacion:   "Incluir actividades de estimulación temprana para compensar posibles efectos del déficit nutricional en el desarrollo.",
    derivacion:     "Considerar derivación a nutricionista para evaluación dietética detallada.",
  },
  alto: {
    alimentacion:   "Iniciar de inmediato una dieta terapéutica rica en hierro. Priorizar sangrecita, hígado y carnes rojas diariamente.",
    suplementacion: "Iniciar o ajustar tratamiento con hierro terapéutico según dosis indicada por el médico. Supervisar adherencia diaria.",
    controles:      "Programar control en los próximos 15 días. Solicitar hemograma completo para confirmar diagnóstico.",
    higiene:        "Implementar urgentemente medidas de saneamiento: agua segura, desparasitación y control de infecciones.",
    estimulacion:   "Derivar a programa de estimulación temprana dado el riesgo de afectación del desarrollo neurológico.",
    derivacion:     "Derivar urgentemente a médico pediatra o nutricionista para evaluación y tratamiento especializado.",
  },
}

export function evaluarRespuestas(respuestas) {
  const reglasEvaluadas = REGLAS.map(r => ({
    ...r,
    activada: r.condicion(respuestas),
    puntosObtenidos: r.condicion(respuestas) ? r.puntos : 0,
  }))
  const total = reglasEvaluadas.reduce((acc, r) => acc + r.puntosObtenidos, 0)
  const nivel = total <= 5 ? "bajo" : total <= 12 ? "moderado" : "alto"
  return { reglasEvaluadas, total, nivel }
}
