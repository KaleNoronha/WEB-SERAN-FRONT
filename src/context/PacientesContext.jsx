import { createContext, useContext, useState } from "react"
import { pacientes as pacientesMock } from "../data/mock"

const PacientesContext = createContext()

export function PacientesProvider({ children }) {
  const [pacientes, setPacientes] = useState(pacientesMock)

  function agregarPaciente(paciente) {
    setPacientes(prev => [...prev, { ...paciente, id: Date.now() }])
  }

  return (
    <PacientesContext.Provider value={{ pacientes, agregarPaciente, setPacientes }}>
      {children}
    </PacientesContext.Provider>
  )
}

export function usePacientes() {
  return useContext(PacientesContext)
}
