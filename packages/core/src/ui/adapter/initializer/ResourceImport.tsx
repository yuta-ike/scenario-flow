import React, { useMemo, useState } from "react"
import { TbCheck } from "react-icons/tb"

import { useProjectContext } from "../ProjectContext"
import { useInjected } from "../container"
import { uploadOpenApiFile } from "../command"

import { Button } from "@/ui/components/common/Button"
import { parseYaml } from "@/ui/lib/yaml/yamlToJson"
import { addSetOp } from "@/utils/set"

type Props = {
  children: React.ReactNode
}

export const ResourceImport = ({ children }: Props) => {
  const context = useProjectContext()
  const injected = useInjected()

  const resources = useMemo(
    () =>
      Object.entries(context.config.resources.openapi?.local_file ?? {}).map(
        ([name, path]) => {
          return { name, path }
        },
      ),
    [context.config.resources.openapi?.local_file],
  )

  const [resolvedResourceNames, setResolvedResourceNames] = useState(
    new Set<string>(),
  )

  const [completed, setCompleted] = useState(false)

  const handleAddResource = async (name: string) => {
    const fileHandle = await injected.io.openFile()
    const content = await injected.io.readFile(fileHandle)

    const json = parseYaml(content)
    if (json.result === "error") {
      window.alert("ファイルの読み込みに失敗しました")
      return
    }
    const result = await uploadOpenApiFile(
      name,
      "",
      fileHandle.path,
      json.value,
    )
    if (result.result === "error") {
      window.alert("OpenAPIファイルの形式が正しくありません")
      return
    }
    setResolvedResourceNames(addSetOp(name))
  }

  if (completed) {
    return children
  } else {
    return (
      <div className="grid h-screen w-screen place-items-center bg-slate-100">
        <section className="flex w-[400px] flex-col overflow-hidden rounded-lg bg-white shadow">
          <div className="p-4">
            <h2 className="text-lg">アクセスできないリソースがあります</h2>
          </div>
          <div className="p-4 pt-0">
            {resources.map(({ name }) => (
              <div
                key={name}
                className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 p-2"
              >
                <div className="text-sm text-slate-600">
                  {name}（ローカルファイル）
                </div>
                {resolvedResourceNames.has(name) ? (
                  <div className="flex items-center gap-1 px-2 py-1 text-sm font-bold text-green-600">
                    <TbCheck strokeWidth={3} />
                    OK
                  </div>
                ) : (
                  <Button
                    size="sm"
                    theme="primary"
                    onClick={() => handleAddResource(name)}
                  >
                    ファイルを選択
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="flex shrink-0 justify-end gap-4 border-t border-t-slate-200 bg-slate-50 px-4 py-3">
            <Button type="submit" onClick={() => setCompleted(true)}>
              確定
            </Button>
          </div>
        </section>
      </div>
    )
  }
}
