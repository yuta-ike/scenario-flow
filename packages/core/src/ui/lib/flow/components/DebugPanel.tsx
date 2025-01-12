import { useAtomValue } from "jotai"

import { actionIdCountCache } from "@/domain/datasource/node"

export const DebugPanel = () => {
  const values = useAtomValue(actionIdCountCache)
  return (
    <div className="p-2">
      <div className="mb-1 grow text-xs text-slate-600">デバッグ</div>
      <table className="flex flex-col gap-1 rounded border border-slate-200 bg-slate-50 p-2 font-mono text-xs text-slate-600">
        <tbody>
          {values
            .entries()
            .map(([key, value]) => (
              <tr key={key}>
                <td>{key}</td>
                <td className="pl-4">{value}</td>
              </tr>
            ))
            .toArray()}
        </tbody>
      </table>
    </div>
  )
}
