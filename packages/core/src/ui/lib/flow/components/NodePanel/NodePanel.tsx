import { BlockMenu } from "../../../../page/index/BlockMenu"

export const NodePanel = () => {
  return (
    <div className="flex min-h-0 flex-col border-t border-t-slate-200">
      <div className="w-full shrink-0 bg-white p-2">
        <div className="text-xs text-slate-600">API一覧</div>
      </div>
      <div className="min-h-0 grow">
        <BlockMenu />
      </div>
    </div>
  )
}
