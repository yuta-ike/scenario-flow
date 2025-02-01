import { useCallback, useEffect, useRef, useState } from "react"
import { FiPlus } from "react-icons/fi"

import { MagicVariableButton } from "../MagicVariableButton"
import { Section } from "../Section"

import type { SetStateAction } from "react"
import type { RequestBodyObject } from "openapi3-ts/oas31"
import type { SchemaObject } from "ajv"
import type { KVItem } from "@scenario-flow/util"
import { Select, Button, ErrorBoundary } from "@scenario-flow/ui"
import {
  ContentType,
  safelyParseJson,
  Json,
  CONTENT_TYPES,
  strigifyJson,
  applyUpdate,
} from "@scenario-flow/util"

import { updateActionInstance } from "../../../../../adapter/command"
import { useParentNodeEnvironment } from "../../../../../adapter/query"
import { EditorRef, Editor2 } from "../../../../editor/Editor2"
import { ParameterTable } from "../../../../ParameterTable"
import { useStore } from "../../../../provider"
import {
  NodeId,
  ResolvedRestCallActionInstance,
} from "../../../../../../domain/entity"

type Props = {
  nodeId: NodeId
  ai: ResolvedRestCallActionInstance
}

export const RequestBodySection = ({ nodeId, ai }: Props) => {
  const store = useStore()

  // content type and body
  const [contentTypeTab, setContentTypeTab] = useState<ContentType | null>(
    "application/json",
  )

  const ref = useRef<EditorRef>(null)
  const handleInsertToRequestJson = useCallback((variableName: string) => {
    ref.current?.insertValue(`{{${variableName}}}`)
  }, [])

  const environment = useParentNodeEnvironment(nodeId)

  const handleUpdateFormDataParameter = useCallback(
    (update: SetStateAction<KVItem[]>) => {
      updateActionInstance(store, nodeId, ai.id, {
        ...ai,
        instanceParameter: {
          ...ai.instanceParameter,
          body: {
            selected: "application/form-data",
            params: {
              ...ai.instanceParameter.body?.params,
              "application/form-data": applyUpdate(
                update,
                ai.instanceParameter.body?.params["application/form-data"] ??
                  [],
              ),
            },
          },
        },
      })
    },
    [ai, nodeId],
  )

  const [jsonInvalid, setJsonInvalid] = useState(false)
  const handleUpdateJsonParameter = useCallback(
    (update: string) => {
      const json = safelyParseJson<Json, null>(update, { orElse: null })
      if (json == null) {
        setJsonInvalid(true)
        return
      }
      updateActionInstance(store, nodeId, ai.id, {
        ...ai,
        instanceParameter: {
          ...ai.instanceParameter,
          body: {
            selected: "application/json",
            params: {
              ...ai.instanceParameter.body?.params,
              "application/json": json,
            },
          },
        },
      })
      setJsonInvalid(false)
    },
    [ai, nodeId],
  )

  return (
    <Section title="リクエストボディ">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <div className="w-max min-w-[120px] text-slate-600">
            {contentTypeTab != null ? (
              <Select<ContentType | null>
                items={[
                  ...CONTENT_TYPES.map((contentType) => ({
                    id: contentType,
                    label: contentType,
                  })),
                  {
                    id: null,
                    label: "-",
                  },
                ]}
                value={contentTypeTab}
                onChange={setContentTypeTab}
              />
            ) : (
              <Button
                theme="secondary"
                size="sm"
                prefix={FiPlus}
                onClick={() =>
                  setContentTypeTab(
                    ai.instanceParameter.body?.selected ?? "application/json",
                  )
                }
              >
                リクエストボディを追加
              </Button>
            )}
          </div>
          <ErrorBoundary>
            <div>
              <MagicVariableButton
                environment={environment}
                onInsert={handleInsertToRequestJson}
              />
            </div>
          </ErrorBoundary>
        </div>
        <div>
          {contentTypeTab === "application/json" ? (
            <>
              <div className="relative w-full rounded border border-slate-200 text-sm">
                <Editor2
                  lang="json"
                  initValue={strigifyJson(
                    ai.instanceParameter.body?.params["application/json"] ?? {},
                  )}
                  schema={
                    (
                      ai.action.schema.jsonSchema?.requestBody as
                        | RequestBodyObject
                        | undefined
                    )?.content["application/json"]?.schema as
                      | SchemaObject
                      | undefined
                  }
                  minimap={false}
                  theme="light"
                  environment={environment}
                  onChange={handleUpdateJsonParameter}
                  ref={ref}
                  fitHeight
                />
              </div>
              {jsonInvalid && (
                <div className="mt-1 text-xs text-red-500/80">
                  JSON形式が不正です
                </div>
              )}
            </>
          ) : contentTypeTab === "application/form-data" ? (
            <ParameterTable
              rows={
                ai.instanceParameter.body?.params["application/form-data"] ?? []
              }
              setRows={handleUpdateFormDataParameter}
              placeholderKey="name"
              placeholderValue="John Doe"
              environment={environment}
              currentNodeId={nodeId}
            />
          ) : null}
        </div>
      </div>
    </Section>
  )
}
