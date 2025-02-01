import { TbCircleCheck, TbCircleMinus, TbCircleX } from "react-icons/tb"
import { Result } from "../../../domain/entity"

const STYLES = {
  success: {
    icon: TbCircleCheck,
    color: "#41BB16",
    label: "成功",
  },
  failure: {
    icon: TbCircleX,
    color: "#FF4B4B",
    label: "失敗",
  },
  skipped: {
    icon: TbCircleMinus,
    color: "#A4A4A4",
    label: "スキップ",
  },
} as const

type Props = {
  result: Result
  size?: number
}

export const ResultIcon = ({ result, size }: Props) => {
  const style = STYLES[result]
  const Icon = style.icon
  return <Icon stroke={style.color} size={size} />
}

export const getText = (result: Result) => STYLES[result].label
