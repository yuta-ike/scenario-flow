import { Context, Effect } from "effect"

import {
  toGlobalVariableId,
  toGlobalVariableValueId,
} from "../entity/globalVariable/globalVariable.util"
import { DEFAULT_PATTERN_ID } from "../datasource/globalVariable"
import {
  type GlobalVariable,
  type GlobalVariableId,
  type GlobalVariableBind,
  type GlobalVariableBindId,
  buildGlobalVariable,
  buildGlobalVariableBind,
} from "../entity/globalVariable/globalVariable"

import type { TypedValue } from "../entity/value/dataType"
import { ContextOf } from "../../lib/effect/contextOf"

export type AddGlobalVariable = (params: GlobalVariable) => void
export const AddGlobalVariable =
  Context.GenericTag<AddGlobalVariable>("AddGlobalVariable")
const _addGlobalVariable = (params: GlobalVariable) =>
  AddGlobalVariable.pipe(
    Effect.map((addGlobalVariable) => addGlobalVariable(params)),
  )

export type AddGlobalVariableBind = (params: GlobalVariableBind) => void
export const AddGlobalVariableBind = Context.GenericTag<AddGlobalVariableBind>(
  "AddGlobalVariableBind",
)
const _addGlobalVariableBind = (params: GlobalVariableBind) =>
  AddGlobalVariableBind.pipe(
    Effect.map((addGlobalVariableValue) => addGlobalVariableValue(params)),
  )

export type UpdateGlobalVariable = (params: GlobalVariable) => void
export const UpdateGlobalVariable = Context.GenericTag<UpdateGlobalVariable>(
  "UpdateGlobalVariable",
)
const _updateGlobalVariable = (params: GlobalVariable) =>
  UpdateGlobalVariable.pipe(
    Effect.map((updateGlobalVariable) => updateGlobalVariable(params)),
  )

export type UpdateGlobalVariableValue = (
  id: GlobalVariableBindId,
  value: TypedValue,
) => void
export const UpdateGlobalVariableValue =
  Context.GenericTag<UpdateGlobalVariableValue>("UpdateGlobalVariableValue")
const _updateGlobalVariableValue = (
  id: GlobalVariableBindId,
  value: TypedValue,
) =>
  UpdateGlobalVariableValue.pipe(
    Effect.map((updateGlobalVariableValue) =>
      updateGlobalVariableValue(id, value),
    ),
  )

export const addGlobalVariable = (params: {
  id: string
  name: string
}): Effect.Effect<
  GlobalVariableId,
  void,
  ContextOf<typeof _addGlobalVariable | typeof _addGlobalVariableBind>
> =>
  Effect.Do.pipe(
    Effect.let("globalVariableId", () => toGlobalVariableId(params.id)),
    Effect.tap(({ globalVariableId }) =>
      _addGlobalVariable(
        buildGlobalVariable(globalVariableId, {
          name: params.name,
          namespace: "vars",
          description: "",
          schema: "any",
          boundIn: "global",
        }),
      ),
    ),
    Effect.tap(({ globalVariableId }) =>
      _addGlobalVariableBind(
        buildGlobalVariableBind(
          toGlobalVariableValueId(`${params.id}-${DEFAULT_PATTERN_ID}`),
          {
            patternId: DEFAULT_PATTERN_ID,
            globalVariableId,
            value: { type: "string", value: "" },
          },
        ),
      ),
    ),
    Effect.map(({ globalVariableId }) => globalVariableId),
  )

export const updateGlobalVariable = (
  params: GlobalVariable,
): Effect.Effect<void, never, ContextOf<typeof _updateGlobalVariable>> =>
  _updateGlobalVariable(params)

export const updateGlobalVariableValue = (
  id: GlobalVariableBindId,
  value: TypedValue,
): Effect.Effect<void, never, ContextOf<typeof _updateGlobalVariableValue>> =>
  _updateGlobalVariableValue(id, value)
