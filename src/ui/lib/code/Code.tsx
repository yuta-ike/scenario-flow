import { useMemo, useState } from "react"
import { TbFlag2 } from "react-icons/tb"

import { Editor } from "../editor/Editor"

import type { Json } from "@/utils/json"

import { useRunnFormat } from "@/ui/adapter/query"
import { jsonToYaml } from "@/utils/yaml"

export const Code = () => {
  const runnFormats = useRunnFormat()

  const yamls = useMemo(
    () =>
      runnFormats.map((runnFormat) => ({
        id: runnFormat["x-id"],
        title: runnFormat.desc,
        color: runnFormat["x-color"],
        yaml: jsonToYaml(runnFormat as Json),
      })),
    [runnFormats],
  )

  console.log(runnFormats)

  const [selectedId, setSelectedId] = useState<string | null>(
    yamls[0]?.id ?? null,
  )
  const targetYaml = yamls.find((yaml) => yaml.id === selectedId)

  return (
    <div className="flex h-full max-h-screen flex-col">
      <div className="flex shrink-0 items-center gap-1 bg-[#4d5064] p-1 pt-1.5">
        {yamls.map(({ id, title, color }, index) => {
          return (
            <button
              type="button"
              aria-pressed={id === selectedId}
              className="group relative flex max-w-[160px] items-center gap-1 overflow-hidden truncate rounded bg-[#2D2F3F] py-2 pl-3 pr-4 text-xs text-white/50 aria-[pressed=true]:after:absolute aria-[pressed=true]:after:inset-x-0 aria-[pressed=true]:after:bottom-0 aria-[pressed=true]:after:h-[3px] aria-[pressed=true]:after:bg-current aria-[pressed=true]:after:opacity-80"
              style={{ color }}
              key={id}
              onClick={() => setSelectedId(id ?? `${index}`)}
            >
              <TbFlag2
                style={{ color }}
                size={16}
                className="group-aria-[pressed=true]:fill-current"
              />
              <span className="text-white/50 group-aria-[pressed=true]:text-white">
                {title}
              </span>
            </button>
          )
        })}
      </div>
      <Editor lang="yaml" value={targetYaml?.yaml ?? ""} className="grow" />
    </div>
  )
}
