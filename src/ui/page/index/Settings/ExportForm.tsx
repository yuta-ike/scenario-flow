import React, { useState } from "react"
import { TbFile } from "react-icons/tb"

import type { Json } from "@/utils/json"

import { FormModalContent } from "@/ui/lib/common/FormModal"
import { FormItem } from "@/ui/components/FormItem"
import { RadioPanel } from "@/ui/components/common/RadioPanel"
import { useDecomposedForLib } from "@/ui/adapter/query"
import { zipFiles } from "@/utils/zip"
import { jsonToYaml } from "@/utils/yaml"
import { downloadFile } from "@/ui/utils/download"

export const ExportForm = () => {
  const decomposed = useDecomposedForLib()

  const [exportMethod, setExportMethod] = useState<"zip" | "sync">("zip")

  const download = async () => {
    if (exportMethod === "zip") {
      const blob = await zipFiles(
        decomposed.map((format) => {
          const file = new File(
            [jsonToYaml(format as Json)],
            `scenario/${format.meta.title}.yaml`,
            {
              type: "application/yaml",
            },
          )
          return file
        }),
      )
      downloadFile(blob, "scenario.zip")
    } else {
      window.alert("Not Implemented")
      throw new Error("Not Implemented")
    }
  }

  return (
    <FormModalContent onSubmit={download} okLabel="実行">
      <FormItem id="method" label="エクスポート方法を選択">
        <div className="grid grid-cols-2 gap-2">
          <RadioPanel
            name="method"
            value="export"
            icon={TbFile}
            onChange={(e) => e.target.checked && setExportMethod("sync")}
          >
            FileSystem APIで同期する
          </RadioPanel>
          <RadioPanel
            name="method"
            value="export"
            icon={TbFile}
            onChange={(e) => e.target.checked && setExportMethod("zip")}
          >
            ZIP形式でエクスポートする
          </RadioPanel>
        </div>
      </FormItem>
    </FormModalContent>
  )
}
