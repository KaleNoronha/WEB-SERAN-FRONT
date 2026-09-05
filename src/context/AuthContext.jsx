import { createContext, useContext, useEffect, useState } from "react"
import api from "../api/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  function mapearRol(usuarioBackend) {
    return {
      ...usuarioBackend,
      rol: usuarioBackend.rol_id === 1 ? "admin" : "doctor",
    }
  }

  async function cargarUsuarioActual() {
    const token = localStorage.getItem("token")

    if (!token) {
      setUsuario(null)
      setCargando(false)
      return
    }

    try {
      const response = await api.get("/api/auth/me")
      const usuarioMapeado = mapearRol(response.data)
      setUsuario(usuarioMapeado)
    } catch (error) {
      localStorage.removeItem("token")
      setUsuario(null)
    } finally {
      setCargando(false)
    }
  }

  async function login(correo, contrasena) {
    const response = await api.post("/api/auth/login", {
      correo,
      contrasena,
    })

    const token = response.data.access_token
    localStorage.setItem("token", token)

    const usuarioResponse = await api.get("/api/auth/me")
    const usuarioMapeado = mapearRol(usuarioResponse.data)

    setUsuario(usuarioMapeado)

    return usuarioMapeado
  }

  function logout() {
    localStorage.removeItem("token")
    setUsuario(null)
  }

  useEffect(() => {
    cargarUsuarioActual()
  }, [])

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}