import { parseNumber } from "@scenario-flow/util"

export type TimeUnits = "ms" | "s" | "m" | "h" | "d" | "w" | "M" | "y"

export type Time = {
  unit: TimeUnits
  value: number
}

export const parseTime = (
  time: string | number | null | undefined,
): Time | null => {
  if (time == null) {
    return null
  }
  if (typeof time === "number") {
    return { unit: "s", value: time }
  }

  const match = /^(\d+)([a-zA-Z]+)$/.exec(time)
  if (match == null) {
    return null
  }

  const [, value, unit] = match
  const parsed = parseNumber(value!)
  if (parsed == null) {
    return null
  }
  return { unit: unit as TimeUnits, value: parsed }
}

export const formatTime = (
  time: Time | number | undefined | null,
): string | null => {
  if (time == null) {
    return null
  }
  if (typeof time === "number") {
    return `${time}`
  }
  return `${time.value}${time.unit}`
}
