import { TbCode, TbList, TbSettings } from "react-icons/tb"

import { ConnectIcon } from "@scenario-flow/ui"
import { useHotkey } from "@scenario-flow/util"
import { FiRotateCw } from "react-icons/fi"
import { useReloader } from "../../../adapter/initializer"

type Props = {
  current: "flow" | "list" | "code" | "settings"
  onChangeContent: (content: "flow" | "list" | "code" | "settings") => void
}

export const Sidebar = ({ current, onChangeContent }: Props) => {
  const ref = useHotkey<HTMLButtonElement>("d")
  const reload = useReloader()

  return (
    <div className="flex max-h-full w-full flex-col gap-4 p-1.5">
      <button
        type="button"
        className="grid place-items-center rounded-full p-2 transition hover:bg-slate-100"
        aria-label="リロード"
        onClick={() => reload()}
      >
        <FiRotateCw size={24} />
      </button>
      <div className="flex flex-col gap-1 rounded-full bg-slate-200 p-1">
        <button
          type="button"
          aria-pressed={current === "flow"}
          onClick={() => onChangeContent("flow")}
          className="grid aspect-square place-items-center rounded-full p-2 hover:bg-slate-100 aria-[pressed=true]:bg-black aria-[pressed=true]:text-white aria-[pressed=true]:shadow"
          aria-label="GUI表示"
          ref={current === "flow" ? undefined : ref}
        >
          <ConnectIcon size={20} />
        </button>
        <button
          type="button"
          aria-pressed={current === "list"}
          onClick={() => onChangeContent("list")}
          className="grid aspect-square place-items-center rounded-full p-2 hover:bg-slate-100 aria-[pressed=true]:bg-black aria-[pressed=true]:text-white aria-[pressed=true]:shadow"
          aria-label="リスト表示"
          ref={current === "code" ? undefined : ref}
        >
          <TbList size={20} />
        </button>
        <button
          type="button"
          aria-pressed={current === "code"}
          onClick={() => onChangeContent("code")}
          className="grid aspect-square place-items-center rounded-full p-2 hover:bg-slate-100 aria-[pressed=true]:bg-black aria-[pressed=true]:text-white aria-[pressed=true]:shadow"
          aria-label="コード表示"
          ref={current === "code" ? undefined : ref}
        >
          <TbCode size={20} />
        </button>
      </div>
      <button
        type="button"
        className="grid place-items-center rounded-full p-2 transition hover:bg-slate-100"
        aria-label="設定"
        onClick={() => onChangeContent("settings")}
      >
        <TbSettings size={24} />
      </button>
    </div>
  )
}
