import { Decomposed, DecomposedStep } from "../../domain/entity"

const decomposedCacheKey = (decomposed: Decomposed) =>
  `${decomposed.page}:::${decomposed.title}`

export const calcDiff = (
  baseList: (Decomposed & { page: string })[],
  updatedList: (Decomposed & { page: string })[],
) => {
  const createRoute: Decomposed[] = []
  const updateRoute: Decomposed[] = []

  const routeIds = new Set(baseList.map((base) => base.id))

  const baseCacheKeys = baseList.map(decomposedCacheKey)

  const createStepsAll: DecomposedStep[] = []
  const updateStepsAll: DecomposedStep[] = []

  for (const updated of updatedList) {
    const updatedKey = decomposedCacheKey(updated)
    const baseIndex = baseCacheKeys.indexOf(updatedKey)
    if (baseIndex < 0) {
      // 新規routeを追加
      createRoute.push(updated)
    } else {
      // 同じシナリオが見つかった場合
      // baseCacheKeys.splice(baseIndex, 1)
      routeIds.delete(baseList[baseIndex]!.id)
      const base = baseList[baseIndex]!
      const { idOrder, createSteps, updateSteps } = calcStepsDiff(
        base.steps,
        updated.steps,
      )

      createStepsAll.push(...createSteps)
      updateStepsAll.push(...updateSteps)

      console.log(updated.id, { idOrder, createSteps, updateSteps })

      updateRoute.push({
        ...updated,
        steps: idOrder.map((id) => {
          const created = createSteps.find((step) => step.id === id)
          if (created != null) {
            return created
          }
          const updated = updateSteps.find((step) => step.id === id)
          if (updated != null) {
            return { ...updated, id }
          }
          return base.steps.find((step) => step.id === id)!
        }),
        color: base.color,
        id: base.id,
      })
    }
  }

  // Build new decomposed
  return {
    createRoute,
    updateRoute,
    deleteRoute: Array.from(routeIds),
    createStepsAll,
    updateStepsAll,
  }
}

const getStepCacheKey = (step: DecomposedStep) => step.title

const calcStepsDiff = (
  baseSteps: DecomposedStep[],
  updatedSteps: DecomposedStep[],
) => {
  const createSteps: DecomposedStep[] = []
  const updateSteps: DecomposedStep[] = []
  const idOrder: (string | number)[] = []

  const stepIds = new Set(baseSteps.map((step) => step.id))

  const baseCacheKeys = baseSteps.map(getStepCacheKey)

  updatedSteps.forEach((updated) => {
    const baseIndex = baseCacheKeys.indexOf(getStepCacheKey(updated))
    if (baseIndex < 0) {
      createSteps.push(updated)
      idOrder.push(updated.id)
    } else {
      // baseCacheKeys.splice(baseIndex, 1)
      const baseStep = baseSteps[baseIndex]!
      idOrder.push(baseStep.id)

      updateSteps.push({
        id: baseStep.id,
        title: updated.title,
        description: updated.description,
        skip: updated.skip,
        condition: updated.condition,
        loop: updated.loop,
        actions: updated.actions,
      })
    }
  })

  return {
    createSteps,
    updateSteps,
    deleteSteps: Array.from(new Set(stepIds).difference(new Set(idOrder))),
    idOrder,
  }
}
