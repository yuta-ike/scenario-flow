type Edge = {
  from: string
  to: string
}

export const getDynamicLayout = (edges: Edge[]) => {
  const nodeIds = new Set(edges.map(({ from, to }) => [from, to]).flat())
  const connMap = edges.reduce((map, { from, to }) => {
    const targets = map.get(from) ?? new Set<string>()
    targets.add(to)
    map.set(from, targets)
    return map
  }, new Map<string, Set<string>>())

  const leafOrMiddileNodes = new Set(
    connMap
      .values()
      .map((targets) => targets.values().toArray())
      .toArray()
      .flat(),
  )
  const rootNodes = nodeIds.difference(leafOrMiddileNodes)

  const nodeLayerMap = new Map<string, number>()
  {
    let layerIndex = 0
    const nextOpeningSet = new Set(rootNodes)
    while (nextOpeningSet.size !== 0) {
      const currentOpeningSet = new Set(nextOpeningSet)
      nextOpeningSet.clear()
      for (const nodeId of currentOpeningSet) {
        // 同じノードが複数レイヤーに位置する場合は、後ろのレイヤーを優先するため上書きしてしまって良い
        nodeLayerMap.set(nodeId, layerIndex)
        const targets = connMap.get(nodeId)
        if (targets === undefined) {
          continue
        }
        for (const target of targets) {
          nextOpeningSet.add(target)
        }
      }
      layerIndex++
    }
  }

  const layerMap = new Map<number, string[]>()
  for (const [nodeId, layerIndex] of nodeLayerMap) {
    const nodes = layerMap.get(layerIndex) ?? []
    nodes.push(nodeId)
    layerMap.set(layerIndex, nodes)
  }

  const layerCount = layerMap.size
  const occupiedCellCount = new Map<string, number>()
  {
    let layerIndex = 0
    while (layerIndex < layerCount) {
      const nodes = layerMap.get(layerIndex) ?? []
      let reservedCount = 0
      let nodeIndex = 0
      for (const nodeId of nodes) {
        // 二世代下って、必要な幅を計算する
        const consumeCount =
          connMap
            .get(nodeId)
            ?.values()
            .reduce(
              (acc, child) => acc + Math.max(connMap.get(child)?.size ?? 0, 1),
              0,
            ) ?? 0

        reservedCount += consumeCount

        if (nodeIndex + 1 < reservedCount) {
          // TODO: ここで、childの半分以上が始点方向に偏ってしまうとよくないので調整必須
          // 予約すべきセル数が足りない場合は、占有セルを増やして対応する
          occupiedCellCount.set(nodeId, reservedCount - (nodeIndex + 1) + 1)
        } else {
          occupiedCellCount.set(nodeId, 1)
        }

        nodeIndex++
      }
      layerIndex++
    }
  }

  return nodeIds
    .values()
    .map((nodeId) => ({
      occupiedCellCount: occupiedCellCount.get(nodeId),
      layer: nodeLayerMap.get(nodeId),
    }))
    .toArray()
}
