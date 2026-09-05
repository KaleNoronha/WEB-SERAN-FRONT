import { createContext, useContext, useState } from "react"

const RecomendacionesContext = createContext()

export const CATEGORIAS_RECOMENDACIONES = [
  {
    id: "alimentacion",
    label: "Alimentación",
    descripcion: "Recomendaciones sobre dieta rica en hierro y nutrientes.",
  },
  {
    id: "suplementacion",
    label: "Suplementación",
    descripcion: "Indicaciones sobre hierro, micronutrientes y vitaminas.",
  },
  {
    id: "controles",
    label: "Controles de salud",
    descripcion: "Frecuencia y tipo de controles de crecimiento y desarrollo.",
  },
  {
    id: "higiene",
    label: "Higiene y saneamiento",
    descripcion: "Agua segura, lavado de manos y prevención de parásitos.",
  },
  {
    id: "estimulacion",
    label: "Estimulación temprana",
    descripcion: "Actividades para el desarrollo cognitivo y motor del niño.",
  },
  {
    id: "derivacion",
    label: "Derivación médica",
    descripcion: "Cuándo referir al paciente a un especialista o laboratorio.",
  },
]

export function RecomendacionesProvider({ children }) {
  const [config, setConfig] = useState({
    alimentacion: true,
    suplementacion: true,
    controles: true,
    higiene: false,
    estimulacion: false,
    derivacion: true,
  })

  return (
    <RecomendacionesContext.Provider value={{ config, setConfig }}>
      {children}
    </RecomendacionesContext.Provider>
  )
}

export function useRecomendaciones() {
  return useContext(RecomendacionesContext)
}
