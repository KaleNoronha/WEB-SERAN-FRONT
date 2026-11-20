import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { ChevronDown } from "lucide-react"

function normalizarBusqueda(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
}

export default function SelectCustom({ placeholder, value, onChange, opciones, className = "w-full", disabled = false }) {
  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const ref = useRef(null)
  const portalRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target) && (!portalRef.current || !portalRef.current.contains(e.target))) {
        setAbierto(false)
        setBusqueda("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (disabled) {
      setAbierto(false)
      setBusqueda("")
    }
  }, [disabled])

  function handleOpen() {
    if (disabled) return
    if (ref.current) {
      const r = ref.current.getBoundingClientRect()
      setPos({ top: r.bottom + 8, left: r.left, width: r.width })
    }
    setAbierto(true)
  }

  const seleccionado = opciones.find(o => o.value === value)
  const tokens = normalizarBusqueda(busqueda).split(" ").filter(Boolean)
  // Permite 'Juan Perez' en 'Juan Carlos Perez López', sin exigir palabras contiguas.
  const opcionesFiltradas = opciones.filter(o => {
    const palabras = normalizarBusqueda(o.label).split(" ")
    return tokens.every(token => palabras.some(palabra => palabra.startsWith(token)))
  })

  function seleccionar(opcion) {
    if (disabled) return
    onChange(opcion.value)
    setAbierto(false)
    setBusqueda("")
  }

  return (
    <div className={`relative ${className}`} ref={ref} aria-disabled={disabled}>
      <div className={`w-full flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-slate-500 ${disabled ? "bg-slate-100" : "bg-white"}`}>
        <input
          type="text"
          disabled={disabled}
          placeholder={seleccionado ? seleccionado.label : placeholder}
          value={busqueda}
          onChange={e => { if (!disabled) { setBusqueda(e.target.value); handleOpen() } }}
          onFocus={handleOpen}
          className="flex-1 min-w-0 px-3 py-2 text-xs focus:outline-none bg-transparent disabled:cursor-not-allowed"
        />
        <button type="button" disabled={disabled} aria-label="Mostrar opciones" aria-expanded={abierto && !disabled} onClick={() => abierto ? setAbierto(false) : handleOpen()} className="px-2 text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed">
          <ChevronDown size={12} className={`transition-transform ${abierto ? "rotate-180" : ""}`} />
        </button>
      </div>
      {abierto && !disabled && createPortal(
        <div ref={portalRef} className="fixed bg-white border border-slate-100 rounded-xl shadow-xl z-[9999] overflow-y-auto max-h-48" style={{ top: pos.top, left: pos.left, width: pos.width }}>
          {opcionesFiltradas.length === 0 ? (
            <p className="px-4 py-2.5 text-xs text-slate-400">Sin coincidencias</p>
          ) : opcionesFiltradas.map(o => (
            <button key={o.value} type="button" onMouseDown={e => { e.preventDefault(); seleccionar(o) }} className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-slate-50 ${value === o.value ? "text-slate-800 font-medium" : "text-slate-600"}`}>
              {o.label}
            </button>
          ))}
        </div>, document.body
      )}
    </div>
  )
}
