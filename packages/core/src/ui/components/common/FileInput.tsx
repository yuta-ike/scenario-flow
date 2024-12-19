import { TbFile, TbFileImport } from "react-icons/tb"

import type { FileContent } from "@/utils/file"

import { useInjected } from "@/ui/adapter/container"
import { useProjectContext } from "@/ui/context/context"

type FileImportProps = {
  value: FileContent | null
  onChange: (value: FileContent | null) => void
}

export const FileInput = ({ value, onChange }: FileImportProps) => {
  const {
    io: { selectFile, readFile },
  } = useInjected()

  const { project } = useProjectContext()

  const handleUpload = async () => {
    const file = await selectFile(undefined, { cacheKey: project.id })
    const content = await readFile(file)
    onChange({ ...file, content })
  }

  return (
    <button
      type="button"
      onClick={handleUpload}
      className="relative z-10 flex h-[96px] w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-slate-600 hover:cursor-pointer hover:bg-slate-100"
    >
      {value != null ? (
        <div className="flex flex-col items-center">
          <div className="text-lg font-bold">
            <TbFile size={32} />
          </div>
          <div className="text-xs">{value.name}</div>
        </div>
      ) : (
        <>
          <div className="text-lg font-bold">
            <TbFileImport size={32} />
          </div>
          <div className="text-xs">OpenAPIファイルをインポート</div>
        </>
      )}
    </button>
  )
}
