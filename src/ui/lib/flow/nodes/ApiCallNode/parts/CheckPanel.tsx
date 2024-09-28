import * as Popover from "@radix-ui/react-popover"
import { RxCaretRight } from "react-icons/rx"

import { CustomCheckPanel } from "./CustomCheckPanel"

import { Switch } from "@/ui/lib/common/Switch"

export const CheckPanel = () => {
  return (
    <Popover.Root>
      <Popover.Trigger className="group flex items-center justify-between rounded-lg bg-white px-3 py-1 text-start font-bold leading-none text-[#8E8E8E] shadow-object transition hover:bg-slate-100 active:translate-y-0.5">
        <div className="flex items-center gap-1 text-[10px]">
          レスポンスチェック
          <span className="grid h-4 w-4 scale-75 place-items-center rounded-full bg-[#8E8E8E] text-[10px] leading-none text-white">
            1
          </span>
        </div>
        <div className="rounded p-0.5">
          <RxCaretRight size={18} />
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="right"
          sideOffset={12}
          align="start"
          className="w-[300px] rounded-lg bg-white p-4 text-[#333333] shadow-object"
        >
          <ul className="flex w-full flex-col gap-4">
            <li className="flex items-center text-sm">
              <div className="grow">ステータスチェック</div>
              <div className="shrink-0 font-bold text-[#8E8E8E]">
                <select name="" className="cursor-pointer">
                  <option value="200">200</option>
                  <option value="400">400</option>
                  <option value="500">500</option>
                </select>
              </div>
            </li>
            <li className="flex items-center text-sm">
              <div className="grow">スキーマチェック</div>
              <div className="shrink-0 font-bold text-[#8E8E8E]">
                <Switch />
              </div>
            </li>
            <li className="flex items-center text-sm">
              <div className="grow">カスタムチェック</div>
              <CustomCheckPanel>
                <button className="shrink-0 rounded border border-slate-200 px-2 py-1.5 text-xs font-bold leading-none text-[#8E8E8E] transition hover:bg-slate-100 active:translate-y-px">
                  未設定
                </button>
              </CustomCheckPanel>
            </li>
          </ul>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
