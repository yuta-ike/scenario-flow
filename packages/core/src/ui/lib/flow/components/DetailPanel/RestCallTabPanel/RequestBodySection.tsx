import React, { useCallback, useRef, useState } from "react"
import { FiPlus } from "react-icons/fi"

import { MagicVariableButton } from "../MagicVariableButton"
import { Section } from "../Section"

import type { SetStateAction } from "react"
import type { RequestBodyObject } from "openapi3-ts/oas31"
import type { SchemaObject } from "ajv"
import type { Json } from "@/utils/json"
import type { ContentType } from "@/utils/http"
import type { KVItem } from "@/ui/lib/kv"
import type { NodeId } from "@/domain/entity/node/node"
import type { ResolvedRestCallActionInstance } from "@/domain/entity/node/actionInstance"
import type { EditorRef } from "@/ui/lib/editor/Editor2"

import { safelyParseJson, strigifyJson } from "@/utils/json"
import { applyUpdate } from "@/ui/utils/applyUpdate"
import { CONTENT_TYPES } from "@/utils/http"
import { updateActionInstance } from "@/ui/adapter/command"
import { Button } from "@/ui/components/common/Button"
import { ParameterTable } from "@/ui/lib/ParameterTable"
import { Editor2 } from "@/ui/lib/editor/Editor2"
import { ErrorBoundary } from "@/ui/components/ErrorBoundary"
import { Select } from "@/ui/components/common/Select"
import { useParentNodeEnvironment } from "@/ui/adapter/query"

type Props = {
  nodeId: NodeId
  ai: ResolvedRestCallActionInstance
}

export const RequestBodySection = ({ nodeId, ai }: Props) => {
  // content type and body
  const [contentTypeTab, setContentTypeTab] = useState<ContentType | null>(
    ai.instanceParameter.body?.selected ?? null,
  )

  const ref = useRef<EditorRef>(null)
  const handleInsertToRequestJson = useCallback((variableName: string) => {
    ref.current?.insertValue(`{{${variableName}}}`)
  }, [])

  const environment = useParentNodeEnvironment(nodeId)

  const handleUpdateFormDataParameter = useCallback(
    (update: SetStateAction<KVItem[]>) => {
      updateActionInstance(nodeId, ai.id, {
        ...ai,
        instanceParameter: {
          ...ai.instanceParameter,
          body: {
            selected: ai.instanceParameter.body?.selected,
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
      updateActionInstance(nodeId, ai.id, {
        ...ai,
        instanceParameter: {
          ...ai.instanceParameter,
          body: {
            selected: ai.instanceParameter.body?.selected,
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
              <div className="relative -mx-3 w-[calc(100%+24px)] overflow-hidden rounded border border-slate-200 text-sm">
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
