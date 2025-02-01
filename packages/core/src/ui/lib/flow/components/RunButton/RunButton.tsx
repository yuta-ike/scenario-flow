import { TbPlayerPlay } from "react-icons/tb"

import { RunModalContent } from "./RunModalContent"
import { CustomModal } from "@scenario-flow/ui"

export const RunButton = () => {
  return (
    <CustomModal modal={<RunModalContent />}>
      <button
        type="button"
        className="item-center group flex cursor-pointer gap-2 rounded-lg bg-slate-800 px-3 py-2.5 leading-none text-white shadow-sm ring-slate-800 ring-offset-2 transition hover:shadow-lg focus:outline-none focus-visible:ring-2"
      >
        <TbPlayerPlay className="transition group-hover:scale-110" />
        実行する
      </button>
    </CustomModal>
  )
}
