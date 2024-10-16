import { useCallback, useRef, useState } from "react"

import { Section } from "./Section"
import { MagicVariableButton } from "./MagicVariableButton"

import type { RequestBodyObject, SchemaObject } from "openapi3-ts/oas31"
import type { SetStateAction } from "react"
import type { NodeId } from "@/domain/entity/node/node"
import type { ResolvedRestCallActionInstance } from "@/domain/entity/node/actionInstance"
import type { EditorRef } from "@/ui/lib/editor/Editor"
import type { KVItem } from "@/ui/lib/kv"

import { CONTENT_TYPES, type ContentType } from "@/utils/http"
import { ParameterTable } from "@/ui/lib/ParameterTable"
import { MethodChip } from "@/ui/components/common/MethodChip"
import { Select } from "@/ui/components/common/Select"
import { updateActionInstance } from "@/ui/adapter/command"
import { applyUpdate } from "@/ui/utils/applyUpdate"
import { safelyParseJson, strigifyJson } from "@/utils/json"
import { TextareaAutosize } from "@/ui/components/common/TextareaAutosize"
import { Editor2 } from "@/ui/lib/editor/Editor2"
import { useParentNodeEnvironment } from "@/ui/adapter/query"
import { ErrorBoundary } from "@/ui/functional-components/ErrorBoundary"

type RestCallTabPanelProps = {
  nodeId: NodeId
  ai: ResolvedRestCallActionInstance
}

export const RestCallTabPanel = ({ nodeId, ai }: RestCallTabPanelProps) => {
  // description
  const handleUpdateDescription = useCallback(
    (update: string) => {
      updateActionInstance(nodeId, ai.id, {
        ...ai,
        description: applyUpdate(update, ai.description),
        instanceParameter: {
          ...ai.instanceParameter,
        },
      })
    },
    [ai, nodeId],
  )

  // content type and body
  const [contentTypeTab, setContentTypeTab] = useState<ContentType | null>(
    "application/json",
  )

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
      const json = safelyParseJson<null>(update, { orElse: null })
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

  // instance parameter
  const handleUpdateInstanceParameter = useCallback(
    (
      update: SetStateAction<KVItem[]>,
      key: "headers" | "cookies" | "pathParams" | "queryParams",
    ) => {
      updateActionInstance(nodeId, ai.id, {
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

  const ref = useRef<EditorRef>(null)
  const handleInsertToRequestJson = useCallback((variableName: string) => {
    ref.current?.insertValue(`{{${variableName}}}`)
  }, [])

  // environment
  const environment = useParentNodeEnvironment(nodeId)

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* タイトル */}
      <Section>
        <div className="flex flex-col px-2">
          <div className="flex items-center">
            <div className="flex grow items-center gap-3">
              <MethodChip size="lg">{ai.instanceParameter.method!}</MethodChip>{" "}
              <div className="text grow leading-none">
                {ai.instanceParameter.path!}
              </div>
            </div>
            <div className="shrink-0">
              {ai.action.schema.jsonSchema?.tags?.map((tag) => (
                <div key={tag} className="text-sm text-slate-600">
                  {tag}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <TextareaAutosize
              className="w-[calc(100%+16px)] -translate-x-2 resize-none rounded border border-transparent px-[7px] py-2 text-sm transition hover:border-slate-200 focus:border-slate-200 focus:outline-none"
              value={
                0 < ai.description.length
                  ? ai.description
                  : ai.action.description
              }
              onChange={(e) => handleUpdateDescription(e.target.value)}
              placeholder="説明を追加"
            />
          </div>
        </div>
      </Section>
      <Section title="リクエストボディ">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <div className="w-max text-slate-600">
              <Select<ContentType | null>
                items={[
                  {
                    id: null,
                    label: "リクエストボディなし",
                  },
                  ...CONTENT_TYPES.map((contentType) => ({
                    id: contentType,
                    label: contentType,
                  })),
                ]}
                value={contentTypeTab}
                onChange={setContentTypeTab}
              />
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
                <div className="relative text-sm">
                  <Editor2
                    lang="json"
                    initValue={strigifyJson(
                      ai.instanceParameter.body?.params["application/json"] ??
                        {},
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
                    environment={environment}
                    onChange={handleUpdateJsonParameter}
                    ref={ref}
                    fitHeight
                    className="rounded-md shadow-md"
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
                  ai.instanceParameter.body?.params["application/form-data"] ??
                  []
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
      <Section title="パスパラメータ">
        <div className="flex flex-col gap-0.5">
          <ParameterTable
            rows={ai.instanceParameter.pathParams ?? []}
            setRows={handleUpdatePathParamsParameter}
            placeholderKey="limit"
            placeholderValue="xyz"
            environment={environment}
            currentNodeId={nodeId}
          />
        </div>
      </Section>
      <Section title="クエリパラメータ">
        <div className="flex flex-col gap-0.5">
          <ParameterTable
            rows={ai.instanceParameter.queryParams ?? []}
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
            rows={ai.instanceParameter.headers ?? []}
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
            rows={ai.instanceParameter.cookies ?? []}
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
