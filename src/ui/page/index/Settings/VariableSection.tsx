import { useCallback, useMemo } from "react"

import type { GlobalVariableId } from "@/domain/entity/globalVariable/globalVariable"

import { typedValueToValue } from "@/domain/entity/value/dataType"
import {
  addGlobalVariable,
  updateGlobalVariable,
  updateGlobalVariableValue,
} from "@/ui/adapter/command"
import { useGlobalVariableMatrix, usePatterns } from "@/ui/adapter/query"
import { Section } from "@/ui/components/Section"
import { GlobalVariableTable } from "@/ui/lib/ParameterTable/GlobalVariableTable"
import { associateBy } from "@/utils/set"
import { toGlobalVariableValueId } from "@/domain/entity/globalVariable/globalVariable.util"

export const VariableSection = () => {
  const matrix = useGlobalVariableMatrix()
  const patterns = usePatterns()

  const variablesMap = useMemo(() => associateBy(matrix, "id"), [matrix])
  const patternIds = useMemo(
    () => variablesMap.keys().toArray(),
    [variablesMap],
  )

  const updateKey = useCallback((id: string, value: string, isNew: boolean) => {
    if (isNew) {
      // 新規作成
      addGlobalVariable(id, value)
    }
    return updateGlobalVariable({
      id: id as GlobalVariableId,
      name: value,
      description: "",
      schema: "any",
    })
  }, [])

  const updateValue = useCallback(
    (id: string, index: number, value: string, isNew: boolean) => {
      if (isNew) {
        addGlobalVariable(id, "")
      }

      const patternId = patternIds[index]
      if (patternId == null) {
        return
      }

      return updateGlobalVariableValue(
        toGlobalVariableValueId(`${id}-${patternId}`),
        {
          type: "string",
          value,
        },
      )
    },
    [patternIds],
  )

  const rows = useMemo(() => {
    return (
      variablesMap.get(patternIds[0]!)?.variables.map(({ id, name }) => {
        const values = patternIds
          .map(
            (patternId) =>
              variablesMap
                .get(patternId)
                ?.variables.find(({ id: _id }) => id === _id)?.value,
          )
          .map((value) => typedValueToValue(value!) as string)
        return {
          id,
          key: name,
          values,
        }
      }) ?? []
    )
  }, [patternIds, variablesMap])

  const headers = useMemo(() => patterns.map(({ name }) => name), [patterns])

  return (
    <Section title="グローバル変数">
      <GlobalVariableTable
        headers={headers}
        rows={rows}
        updateKey={updateKey}
        updateValue={updateValue}
        placeholderKey="CLIENT_ID"
        placeholderValue="abcde"
      />
    </Section>
  )
}
