import { useState } from "react"
import AppLayout from "../layouts/AppLayout"
import { useRecomendaciones, CATEGORIAS_RECOMENDACIONES } from "../context/RecomendacionesContext"

export default function ConfigRecomendaciones() {
  const { config, setConfig } = useRecomendaciones()
  const [draft, setDraft] = useState({ ...config })
  const [exito, setExito] = useState(false)
  const [exitoVisible, setExitoVisible] = useState(false)

  const modificado = CATEGORIAS_RECOMENDACIONES.some(c => draft[c.id] !== config[c.id])
  const activasCount = Object.values(draft).filter(Boolean).length

  function handleCancelar() { setDraft({ ...config }) }

  function handleGuardar() {
    setConfig({ ...draft })
    setExito(true)
    setExitoVisible(false)
    setTimeout(() => setExitoVisible(true), 10)
    setTimeout(() => { setExito(false); setExitoVisible(false) }, 3000)
  }

  return (
    <AppLayout>
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-slate-800">Recomendaciones</h1>

        <div className="flex items-center min-h-[36px]">
          <p className="text-xs text-slate-400">{activasCount} de {CATEGORIAS_RECOMENDACIONES.length} categorías activas</p>
        </div>

        {exito && (
          <p className={`text-xs px-3 py-2 rounded-lg border bg-green-50 text-green-700 border-green-200 transition-opacity duration-500 ${exitoVisible ? "opacity-100" : "opacity-0"}`}>
            Configuración guardada correctamente.
          </p>
        )}

        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {CATEGORIAS_RECOMENDACIONES.map(cat => {
            const activa = draft[cat.id]
            return (
              <div key={cat.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex-1 min-w-0 pr-4">
                  <p className={`text-xs font-medium ${activa ? "text-slate-800" : "text-slate-400"}`}>{cat.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.descripcion}</p>
                </div>
                <button
                  onClick={() => setDraft(prev => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                  className={`relative inline-flex w-10 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${activa ? "bg-slate-800" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${activa ? "translate-x-5" : "translate-x-1"}`} />
                </button>
              </div>
            )
          })}
        </div>

        {modificado && (
          <div className="flex gap-3 justify-end">
            <button onClick={handleCancelar} className="text-xs text-slate-600 hover:text-slate-800 px-4 py-2">
              Cancelar
            </button>
            <button onClick={handleGuardar} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-5 py-2 rounded-lg transition-colors">
              Guardar cambios
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
