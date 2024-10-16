import { useMemo, useState } from "react"
import { TbFlag2 } from "react-icons/tb"

import { Editor2 } from "../editor/Editor2"

import { useDecomposedForLib } from "@/ui/adapter/query"
import { jsonToYaml } from "@/utils/yaml"

export const Code = () => {
  const runnFormats = useDecomposedForLib()

  const yamls = useMemo(
    () =>
      runnFormats.map(({ meta, contents }) => ({
        meta,
        yaml: jsonToYaml(contents),
      })),
    [runnFormats],
  )

  const [selectedId, setSelectedId] = useState<string | null>(
    yamls[0]?.meta.id ?? null,
  )
  const targetYaml = yamls.find((yaml) => yaml.meta.id === selectedId)

  return (
    <div className="flex h-full max-h-screen flex-col">
      <div className="flex shrink-0 items-center gap-1 bg-[#4d5064] p-1 pt-1.5">
        {yamls.map(({ meta: { id, title, color } }) => {
          return (
            <button
              type="button"
              aria-pressed={id === selectedId}
              className="group relative flex max-w-[160px] items-center gap-1 overflow-hidden truncate rounded bg-[#2D2F3F] py-2 pl-3 pr-4 text-xs text-white/50 aria-[pressed=true]:after:absolute aria-[pressed=true]:after:inset-x-0 aria-[pressed=true]:after:bottom-0 aria-[pressed=true]:after:h-[3px] aria-[pressed=true]:after:bg-current aria-[pressed=true]:after:opacity-80"
              style={{ color }}
              key={id}
              onClick={() => setSelectedId(id)}
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
      <div className="grow">
        <Editor2
          key={selectedId}
          lang="yaml"
          className="h-full"
          initValue={targetYaml?.yaml ?? ""}
          onChange={console.log}
        />
      </div>
    </div>
  )
}
