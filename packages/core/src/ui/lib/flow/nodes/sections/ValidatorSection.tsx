import type { ValidatorActionInstance } from "@/domain/entity/node/actionInstance"

type ValidatorSectionProps = {
  actionInstance: ValidatorActionInstance
}

export const ValidatorSection = ({ actionInstance }: ValidatorSectionProps) => {
  if (actionInstance.instanceParameter.contents.length === 0) {
    return null
  }
  return (
    <div className="group flex items-center justify-between rounded-lg bg-white px-3 py-2 text-start shadow-object transition hover:bg-slate-100 active:translate-y-0.5">
      <div className="flex w-full items-center gap-1 truncate font-mono text-xs">
        {actionInstance.instanceParameter.contents}
      </div>
    </div>
  )
}
