import { useCallback } from "react"

import { Section } from "../Section"

import { HeaderSection } from "./HeaderSection"
import { RequestBodySection } from "./RequestBodySection"

import type { SetStateAction } from "react"
import { Updater, KVItem, applyUpdate } from "@scenario-flow/util"
import { getKeyStatus } from "../../../../../../domain/openapi/getKeyStatus"
import { updateActionInstance } from "../../../../../adapter/command"
import { useParentNodeEnvironment } from "../../../../../adapter/query"
import { ParameterTable } from "../../../../ParameterTable"
import { useStore } from "../../../../provider"
import {
  NodeId,
  ResolvedRestCallActionInstance,
} from "../../../../../../domain/entity"

type RestCallTabPanelProps = {
  nodeId: NodeId
  ai: ResolvedRestCallActionInstance
}

export const RestCallTabPanel = ({ nodeId, ai }: RestCallTabPanelProps) => {
  const store = useStore()

  // instance parameter
  const handleUpdateInstanceParameter = useCallback(
    (
      update: Updater<KVItem[]>,
      key: "headers" | "cookies" | "pathParams" | "queryParams",
    ) => {
      updateActionInstance(store, nodeId, ai.id, {
        ...ai,
        instanceParameter: {
          ...ai.instanceParameter,
          [key]: applyUpdate(update, ai.instanceParameter[key] ?? []),
        },
      })
    },
    [ai, nodeId],
  )
  const handleUpdateHeadersParameter = useCallback(
    (update: SetStateAction<KVItem[]>) =>
      handleUpdateInstanceParameter(update, "headers"),
    [handleUpdateInstanceParameter],
  )
  const handleUpdateCookiesParameter = useCallback(
    (update: SetStateAction<KVItem[]>) =>
      handleUpdateInstanceParameter(update, "cookies"),
    [handleUpdateInstanceParameter],
  )
  const handleUpdatePathParamsParameter = useCallback(
    (update: SetStateAction<KVItem[]>) =>
      handleUpdateInstanceParameter(update, "pathParams"),
    [handleUpdateInstanceParameter],
  )
  const handleUpdateQueryParamsParameter = useCallback(
    (update: SetStateAction<KVItem[]>) =>
      handleUpdateInstanceParameter(update, "queryParams"),
    [handleUpdateInstanceParameter],
  )

  // environment
  const environment = useParentNodeEnvironment(nodeId)

  const keyStatus = getKeyStatus(ai.action.schema.jsonSchema)

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* タイトル */}
      <HeaderSection nodeId={nodeId} ai={ai} />
      {/* リクエストボディ */}
      <RequestBodySection nodeId={nodeId} ai={ai} />
      {ai.instanceParameter.pathParams != null &&
        0 < ai.instanceParameter.pathParams.length && (
          <Section title="パスパラメータ">
            <div className="flex flex-col gap-0.5">
              <ParameterTable
                rows={ai.instanceParameter.pathParams.map((kv) => ({
                  ...kv,
                  description: keyStatus?.pathParams.get(kv.key)?.description,
                  defined:
                    keyStatus == null || kv.key.length === 0
                      ? undefined
                      : keyStatus.pathParams.get(kv.key) != null,
                  required:
                    keyStatus == null || kv.key.length === 0
                      ? undefined
                      : keyStatus.pathParams.get(kv.key)?.required === true,
                  dataType:
                    keyStatus == null
                      ? undefined
                      : keyStatus.pathParams.get(kv.key)?.dataType,
                }))}
                setRows={handleUpdatePathParamsParameter}
                placeholderKey="limit"
                placeholderValue="xyz"
                environment={environment}
                currentNodeId={nodeId}
                lockNewRow
              />
            </div>
          </Section>
        )}
      <Section title="クエリパラメータ">
        <div className="flex flex-col gap-0.5">
          <ParameterTable
            rows={
              ai.instanceParameter.queryParams?.map((kv) => ({
                ...kv,
                defined:
                  keyStatus == null
                    ? undefined
                    : keyStatus.queryParams.get(kv.key) != null,
                required:
                  keyStatus == null
                    ? undefined
                    : keyStatus.queryParams.get(kv.key)?.required === true,
                dataType:
                  keyStatus == null
                    ? undefined
                    : keyStatus.queryParams.get(kv.key)?.dataType,
              })) ?? []
            }
            setRows={handleUpdateQueryParamsParameter}
            placeholderKey="limit"
            placeholderValue="100"
            environment={environment}
            currentNodeId={nodeId}
          />
        </div>
      </Section>
      <Section title="ヘッダー">
        <div className="flex flex-col gap-0.5">
          <ParameterTable
            rows={
              ai.instanceParameter.headers?.map((kv) => ({
                ...kv,
                defined:
                  keyStatus == null || kv.key.length === 0
                    ? undefined
                    : keyStatus.headers.get(kv.key) != null,
                required:
                  keyStatus == null || kv.key.length === 0
                    ? undefined
                    : keyStatus.headers.get(kv.key)?.required === true,
                dataType:
                  keyStatus == null
                    ? undefined
                    : keyStatus.headers.get(kv.key)?.dataType,
              })) ?? []
            }
            setRows={handleUpdateHeadersParameter}
            placeholderKey="Authorization"
            placeholderValue="Bearer token"
            environment={environment}
            currentNodeId={nodeId}
          />
        </div>
      </Section>
      <Section title="Cookie">
        <div className="flex flex-col gap-0.5">
          <ParameterTable
            rows={
              ai.instanceParameter.cookies?.map((kv) => ({
                ...kv,
                defined:
                  keyStatus == null || kv.key.length === 0
                    ? undefined
                    : keyStatus.cookies.get(kv.key) != null,
                required:
                  keyStatus == null || kv.key.length === 0
                    ? undefined
                    : keyStatus.cookies.get(kv.key)?.required === true,
                dataType:
                  keyStatus == null
                    ? undefined
                    : keyStatus.cookies.get(kv.key)?.dataType,
              })) ?? []
            }
            setRows={handleUpdateCookiesParameter}
            placeholderKey="session_id"
            placeholderValue="1234567890"
            environment={environment}
            currentNodeId={nodeId}
          />
        </div>
      </Section>
    </div>
  )
}
