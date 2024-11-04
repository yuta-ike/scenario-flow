import { TbAlertCircle } from "react-icons/tb"

type Props = {
  children?: string
}

export const ErrorDisplay = ({ children = "エラーが発生しました" }: Props) => {
  return (
    <div className="grid h-full w-full place-items-center">
      <div className="flex flex-col items-center gap-4">
        <TbAlertCircle size={64} />
        <div>{children}</div>
      </div>
    </div>
  )
}
