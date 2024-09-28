import { TbAlertCircle } from "react-icons/tb"

export const ErrorDisplay = () => {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="flex flex-col items-center gap-4">
        <TbAlertCircle size={64} />
        <div>エラーが発生しました</div>
      </div>
    </div>
  )
}
