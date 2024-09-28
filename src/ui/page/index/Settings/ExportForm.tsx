import React from "react"
import { TbFile } from "react-icons/tb"

import type { Json } from "@/utils/json"

import { FormModalContent } from "@/ui/lib/common/FormModal"
import { FormItem } from "@/ui/components/FormItem"
import { RadioPanel } from "@/ui/components/common/RadioPanel"
import { useRunnFormat } from "@/ui/adapter/query"
import { zipFiles } from "@/utils/zip"
import { jsonToYaml } from "@/utils/yaml"
import { downloadFile } from "@/ui/utils/download"

export const ExportForm = () => {
  const runnFormats = useRunnFormat()

  const download = async () => {
    const blob = await zipFiles(
      runnFormats.map((format) => {
        const file = new File(
          [jsonToYaml(format as Json)],
          `scenario/${format.desc}.yaml`,
          {
            type: "application/yaml",
          },
        )
        return file
      }),
    )
    downloadFile(blob, "scenario.zip")
  }

  return (
    <FormModalContent onSubmit={download} okLabel="実行">
      <FormItem id="method" label="エクスポート方法を選択">
        <div className="grid grid-cols-2 gap-2">
          <RadioPanel name="method" value="export" icon={TbFile}>
            FileSystem APIで同期する
          </RadioPanel>
          <RadioPanel name="method" value="export" icon={TbFile}>
            ZIP形式でエクスポートする
          </RadioPanel>
        </div>
      </FormItem>
    </FormModalContent>
  )
}
