import { useState } from "react"
import { TbFile } from "react-icons/tb"

import { FormItem, FormModalContent, RadioPanel } from "@scenario-flow/ui"
import { zipFiles, jsonToYaml, Json, downloadFile } from "@scenario-flow/util"
import { useDecomposedForLib } from "../../../adapter/query"

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
