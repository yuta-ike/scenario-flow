import "./globals.css"

import Core from "@scenario-flow/core"
import { FiMinus, FiX } from "react-icons/fi"

function App() {
  return (
    <div>
      <header className="border-b border-b-slate-200">
        <nav
          data-tauri-drag-region
          className="group flex select-none justify-start gap-2 p-2"
          aria-label="Global"
        >
          <button
            type="button"
            className="grid place-items-center rounded-full bg-[#FF5F57] p-[2px] text-black/0 group-hover:text-black"
          >
            <FiX size={9} strokeWidth={3} />
          </button>
          <button
            type="button"
            className="grid place-items-center rounded-full bg-[#FEBC30] p-[2px] text-black/0 group-hover:text-black"
          >
            <FiMinus size={9} strokeWidth={3} />
          </button>
          <button
            type="button"
            className="grid place-items-center rounded-full bg-[#2BC840] p-[2px] text-black/0 group-hover:text-black"
          >
            <FiX size={9} strokeWidth={3} />
          </button>
        </nav>
      </header>
      <Core />
    </div>
  )
}

export default App
