import { createContext, useContext, useState } from "react"

const PacientesContext = createContext()

export function PacientesProvider({ children }) {
  const [pacientes, setPacientes] = useState([])

  function agregarPaciente(paciente) {
    setPacientes(prev => [...prev, paciente])
  }

  function actualizarPaciente(pacienteActualizado) {
    setPacientes(prev =>
      prev.map(p =>
        String(p.id) === String(pacienteActualizado.id)
          ? { ...p, ...pacienteActualizado }
          : p
      )
    )
  }

  function limpiarPacientes() {
    setPacientes([])
  }

  return (
    <PacientesContext.Provider
      value={{
        pacientes,
        setPacientes,
        agregarPaciente,
        actualizarPaciente,
        limpiarPacientes,
      }}
    >
      {children}
    </PacientesContext.Provider>
  )
}

export function usePacientes() {
  return useContext(PacientesContext)
}