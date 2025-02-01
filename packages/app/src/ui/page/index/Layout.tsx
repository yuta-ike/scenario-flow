import React from "react"
import { TbHome } from "react-icons/tb"
import { ConnectIcon } from "@scenario-flow/ui"

type Props = {
  children: React.ReactNode
  onClickHome?: () => void
  tabs: { id: string; label: string }[]
  onSelect: (id: string) => void
  current?: string
}

export const Layout = ({
  children,
  onClickHome,
  tabs,
  onSelect,
  current,
}: Props) => {
  return (
    <div className="flex h-dvh grow flex-col bg-slate-50">
      <header className="flex shrink-0 gap-1 px-4 py-1">
        <button
          type="button"
          onClick={onClickHome}
          className="flex items-center gap-1 rounded px-1.5 py-1 text-sm text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
        >
          <TbHome size={18} />
          プロジェクト
        </button>
        <hr className="my-1 h-auto self-stretch border-r border-r-slate-200" />
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            data-selected={id === current}
            type="button"
            onClick={() => onSelect(id)}
            className="flex items-center gap-1 rounded px-3 py-1 text-sm text-slate-500 transition hover:bg-slate-200 hover:text-slate-800 data-[selected=true]:bg-slate-200 data-[selected=true]:text-slate-800"
          >
            <ConnectIcon size={18} />
            {label}
          </button>
        ))}
      </header>
      <main className="min-h-0 grow">{children}</main>
    </div>
  )
}
