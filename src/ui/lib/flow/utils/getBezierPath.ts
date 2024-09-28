import { Position, getBezierPath as rfGetBezierPath } from "@xyflow/react"

const getBezierEdgeCenter = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourceControlX,
  sourceControlY,
  targetControlX,
  targetControlY,
}: {
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourceControlX: number
  sourceControlY: number
  targetControlX: number
  targetControlY: number
}) => {
  // cubic bezier t=0.5 mid point, not the actual mid point, but easy to calculate
  // https://stackoverflow.com/questions/67516101/how-to-find-distance-mid-point-of-bezier-curve
  const centerX =
    sourceX * 0.125 +
    sourceControlX * 0.375 +
    targetControlX * 0.375 +
    targetX * 0.125
  const centerY =
    sourceY * 0.125 +
    sourceControlY * 0.375 +
    targetControlY * 0.375 +
    targetY * 0.125
  const offsetX = Math.abs(centerX - sourceX)
  const offsetY = Math.abs(centerY - sourceY)

  return [centerX, centerY, offsetX, offsetY] as const
}

const calculateControlOffset = (distance: number, curvature: number) => {
  if (distance >= 0) {
    return 1 * distance
  }

  return curvature * 25 * Math.sqrt(-distance)
}

const getControlWithCurvature = ({
  pos,
  x1,
  y1,
  x2,
  y2,
  c,
}: {
  pos: Position
  x1: number
  y1: number
  x2: number
  y2: number
  c: number
}) => {
  switch (pos) {
    case Position.Left:
      return [x1 - calculateControlOffset(x1 - x2, c), y1] as const
    case Position.Right:
      return [x1 + calculateControlOffset(x2 - x1, c), y1] as const
    case Position.Top:
      return [x1, y1 - (y1 - y2) / 2] as const
    case Position.Bottom:
      return [x1, y1 + (y2 - y1) / 2] as const
  }
}

export const getBezierPath: typeof rfGetBezierPath = ({
  sourceX,
  sourceY,
  sourcePosition = Position.Bottom,
  targetX,
  targetY,
  targetPosition = Position.Top,
  curvature = 0.25,
}): [
  path: string,
  labelX: number,
  labelY: number,
  offsetX: number,
  offsetY: number,
] => {
  const [sourceControlX, sourceControlY] = getControlWithCurvature({
    pos: sourcePosition,
    x1: sourceX,
    y1: sourceY,
    x2: targetX,
    y2: targetY,
    c: curvature,
  })
  const [targetControlX, targetControlY] = getControlWithCurvature({
    pos: targetPosition,
    x1: targetX,
    y1: targetY,
    x2: sourceX,
    y2: sourceY,
    c: curvature,
  })
  const [labelX, labelY, offsetX, offsetY] = getBezierEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourceControlX,
    sourceControlY,
    targetControlX,
    targetControlY,
  })

  return [
    sourceX < targetX
      ? `
    M${sourceX},${sourceY}

    v${(targetY - sourceY) / 2 - 12}
    a12,12 0 0 0 12,12

    h${targetX - sourceX - 24}
    a12,12, 0 0 1 12,12

    v${(targetY - sourceY) / 2 - 12}
    `
      : `
    M${sourceX},${sourceY}

    v${(targetY - sourceY) / 2 - 12}
    a12,12 0 0 1 -12,12

    h${targetX - sourceX + 24}
    a12,12, 0 0 0 -12,12

    v${(targetY - sourceY) / 2 - 12}
    `,
    labelX,
    labelY,
    offsetX,
    offsetY,
  ]
}
