import { TbQuestionMark, TbHash, TbTextSize, TbAsterisk } from "react-icons/tb"
import { ArrayIcon, Tooltip } from "@scenario-flow/ui"
import { DataType } from "../../../domain/entity"

// eslint-disable-next-line react-refresh/only-export-components
export const getDataTypeIcon = (type: DataType | undefined) => {
  if (type == null) {
    return null
  }
  if (type === "string") {
    return TbTextSize
  }

  if (type === "integer" || type === "number") {
    return TbHash
  }

  if (type === "array") {
    return ArrayIcon
  }

  return TbQuestionMark
}

const getLabel = (type: DataType | undefined) => {
  switch (type) {
    case "string":
      return "String"
    case "integer":
      return "Integer"
    case "number":
      return "Number"
    case "array":
      return "Array"
    default:
      return "Unknown"
  }
}

export const DataTypeIcon = ({
  type,
  required = false,
}: {
  type: DataType | undefined
  required?: boolean
}) => {
  const Icon = getDataTypeIcon(type)
  return Icon != null ? (
    <Tooltip label={required ? `${getLabel(type)}（必須）` : getLabel(type)}>
      <button type="button" className="relative rounded p-1 hover:bg-slate-200">
        <Icon />
        {required && (
          <div className="absolute right-0 top-0 rounded-full p-px text-red-400">
            <TbAsterisk strokeWidth={3} size={9} />
          </div>
        )}
      </button>
    </Tooltip>
  ) : null
}
