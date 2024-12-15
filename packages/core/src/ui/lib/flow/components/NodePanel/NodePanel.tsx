import { BlockMenu } from "@/ui/page/index/BlockMenu"

export const NodePanel = () => {
  return (
    <div className="overflow-y-auto border-t border-t-slate-200">
      <div className="w-full p-2">
        <div className="text-xs text-slate-600">API呼び出し</div>
      </div>
      <div className="pointer-events-none">
        <BlockMenu />
      </div>
    </div>
  )
}
