import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { ChevronDown } from "lucide-react"

export default function SelectCustom({ placeholder, value, onChange, opciones, className = "w-full" }) {
  const [abierto, setAbierto] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const ref = useRef(null)
  const portalRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        ref.current && !ref.current.contains(e.target) &&
        portalRef.current && !portalRef.current.contains(e.target)
      ) {
        setAbierto(false)
        setBusqueda("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleOpen() {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect()
      setPos({ top: r.bottom + 8, left: r.left, width: r.width })
    }
    setAbierto(true)
  }

  const seleccionado = opciones.find(o => o.value === value)
  const opcionesFiltradas = opciones.filter(o => o.label.toLowerCase().includes(busqueda.toLowerCase()))

  function seleccionar(opcion) {
    onChange(opcion.value)
    setAbierto(false)
    setBusqueda("")
  }

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div className="w-full flex items-center border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-slate-500 bg-white">
        <input
          type="text"
          placeholder={seleccionado ? seleccionado.label : placeholder}
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); handleOpen() }}
          onFocus={handleOpen}
          className="flex-1 px-3 py-2 text-xs focus:outline-none bg-white"
        />
        <button type="button" onClick={() => abierto ? setAbierto(false) : handleOpen()} className="px-2 text-slate-400 hover:text-slate-600">
          <ChevronDown size={12} className={`transition-transform ${abierto ? "rotate-180" : ""}`} />
        </button>
      </div>
      {abierto && createPortal(
        <div
          ref={portalRef}
          className="fixed bg-white border border-slate-100 rounded-xl shadow-xl z-[9999] overflow-y-auto max-h-48"
          style={{ top: pos.top, left: pos.left, width: pos.width }}
        >
          {opcionesFiltradas.length === 0 ? (
            <p className="px-4 py-2.5 text-xs text-slate-400">Sin coincidencias</p>
          ) : (
            opcionesFiltradas.map(o => (
              <button
                key={o.value}
                type="button"
                onMouseDown={e => { e.preventDefault(); seleccionar(o) }}
                className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-slate-50 ${value === o.value ? "text-slate-800 font-medium" : "text-slate-600"}`}
              >
                {o.label}
              </button>
            ))
          )}
        </div>,
        document.body
      )}
    </div>
  )
}
