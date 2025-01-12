import { useCallback, useEffect, useState } from "react"
import { TbEdit } from "react-icons/tb"
import { useAtomCallback } from "jotai/utils"

import { Section } from "../Section"

import { DefinitionPanel } from "./DefinitionPanel"

import type { ResolvedRestCallActionInstance } from "@/domain/entity/node/actionInstance"
import type { NodeId } from "@/domain/entity/node/node"
import type { ActionSourceIdentifier } from "@/domain/entity/action/identifier"

import { type HttpMethod } from "@/utils/http"
import { TextareaAutosize } from "@/ui/components/common/TextareaAutosize"
import {
  changeAction,
  changeToNewAction,
  updateActionAndActionInstance,
  updateActionInstance,
  updateUserDefinedAction,
} from "@/ui/adapter/command"
import { applyUpdate } from "@/ui/utils/applyUpdate"
import {
  isResourceAction,
  isUserDefinedAction,
} from "@/domain/entity/action/identifier"
import { PathMethodInput } from "@/ui/components/common/PathMethodInput"
import { MethodChip } from "@/ui/components/common/MethodChip"
import { IconButton } from "@/ui/components/common/IconButton"
import {
  userDefinedActionByIdCountAtom,
  useUserDefinedActionRefCount,
} from "@/ui/adapter/query"
import { Button } from "@/ui/components/common/Button"

type Props = {
  nodeId: NodeId
  ai: ResolvedRestCallActionInstance
}

export const HeaderSection = ({ nodeId, ai }: Props) => {
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    setEditMode(false)
  }, [ai.actionIdentifier])

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

  const handleChangeMethodPath = useAtomCallback(
    useCallback(
      (
        get,
        _,
        data:
          | {
              method: HttpMethod
              path: string
            }
          | {
              identifier: ActionSourceIdentifier
              method: HttpMethod
              path: string
            },
      ) => {
        if ("identifier" in data) {
          changeAction(nodeId, ai.id, data.identifier)
        } else {
          const actionRefCount = get(
            userDefinedActionByIdCountAtom(ai.actionIdentifier),
          )
          if (actionRefCount == 1 && isUserDefinedAction(ai.actionIdentifier)) {
            updateActionAndActionInstance(nodeId, ai.id, ai.actionIdentifier, {
              method: data.method,
              path: data.path,
            })
          } else {
            updateActionInstance(nodeId, ai.id, {
              ...ai,
              instanceParameter: {
                method: data.method,
                path: data.path,
              },
            })
          }
        }
      },
      [ai, nodeId],
    ),
  )

  const handleApplyInstanceParameterToAction = () => {
    if (ai.actionIdentifier.resourceType === "user_defined") {
      updateUserDefinedAction(ai.actionIdentifier, {
        method: ai.instanceParameter.method,
        path: ai.instanceParameter.path,
      })
    }
  }

  const handleChangeToNewAction = () => {
    if (ai.actionIdentifier.resourceType === "user_defined") {
      changeToNewAction(nodeId, ai.id, {
        method: ai.instanceParameter.method ?? "GET",
        path: ai.instanceParameter.path ?? "",
        headers: [],
        cookies: [],
        pathParams: [],
        queryParams: [],
        baseUrl: ai.instanceParameter.baseUrl ?? "",
      })
    }
  }

  const conflictedParameter =
    ("method" in ai.action.schema.base &&
      ai.action.schema.base.method !== ai.instanceParameter.method) ||
    ("path" in ai.action.schema.base &&
      ai.action.schema.base.path !== ai.instanceParameter.path)

  const refCount = useUserDefinedActionRefCount(ai.actionIdentifier)

  return (
    <Section>
      <div className="flex flex-col gap-2">
        {/* メソッド + パス */}
        <div className="flex items-center justify-between">
          {ai.actionIdentifier.resourceType === "user_defined" || editMode ? (
            <PathMethodInput
              method={ai.instanceParameter.method!}
              path={ai.instanceParameter.path!}
              onChange={handleChangeMethodPath}
            />
          ) : (
            <div className="flex items-center gap-4 px-2">
              <MethodChip size="lg">
                {ai.instanceParameter.method ?? "GET"}
              </MethodChip>
              <div>{ai.instanceParameter.path}</div>
            </div>
          )}
          {!editMode && (
            <div className="shrink-0">
              <IconButton
                icon={TbEdit}
                size="sm"
                label="編集"
                variant="segmented"
                onClick={() => setEditMode(true)}
              />
            </div>
          )}
        </div>

        {/* 説明 */}
        <div className="relative">
          <TextareaAutosize
            className="resize-none rounded border border-transparent px-[7px] py-1 text-sm transition hover:border-slate-200 focus:border-slate-200 focus:outline-none"
            value={
              0 < ai.description.length ? ai.description : ai.action.description
            }
            onChange={(e) => handleUpdateDescription(e.target.value)}
            placeholder="説明を追加"
          />
        </div>

        {1 < refCount && conflictedParameter && (
          <div>
            <div className="rounded border border-blue-100 bg-blue-50 p-2 text-[13px] text-slate-600">
              同じエンドポイントを利用している他の呼び出し箇所も修正しますか？
              <br />
              {/* @ts-expect-error */}
              {`・${ai.action.schema.base.method} ${ai.action.schema.base.path} → ${ai.instanceParameter.method!} ${ai.instanceParameter.path!}`}
              <div className="flex items-center justify-end gap-1">
                <Button
                  size="sm"
                  theme="skelton"
                  onClick={handleChangeToNewAction}
                >
                  キャンセル
                </Button>
                <Button
                  size="sm"
                  theme="secondary"
                  onClick={handleApplyInstanceParameterToAction}
                >
                  修正する
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* 定義 */}
        {isResourceAction(ai.action) && <DefinitionPanel action={ai.action} />}
      </div>
    </Section>
  )
}
