import { ExportSection } from "./ExportSection"
import { MetaSection } from "./MetaSection"
import { ResourceSection } from "./ResourceSection"

export const Settings = () => {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[#FAFAFA]">
      <div className="w-full border-b border-b-slate-200 bg-white px-8 py-8">
        <h2 className="text-lg font-bold">設定</h2>
      </div>
      <div className="flex w-full max-w-[900px] flex-col gap-8 p-8">
        <MetaSection />
        <ResourceSection />
        <ExportSection />
      </div>
    </div>
  )
}
