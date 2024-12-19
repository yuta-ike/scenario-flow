import { TbQuestionMark, TbHash, TbTextSize } from "react-icons/tb"

import { ArrayIcon } from "../icons/ArrayIcon"

import { Tooltip } from "./Tooltip"

import type { DataType } from "@/domain/entity/value/dataType"

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

export const DataTypeIcon = ({ type }: { type: DataType | undefined }) => {
  const Icon = getDataTypeIcon(type)
  return Icon != null ? (
    <Tooltip label={getLabel(type)}>
      <button type="button">
        <Icon />
      </button>
    </Tooltip>
  ) : null
}
