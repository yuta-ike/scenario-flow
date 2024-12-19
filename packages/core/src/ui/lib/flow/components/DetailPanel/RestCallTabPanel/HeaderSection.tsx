import { useCallback } from "react"
import { FiEdit } from "react-icons/fi"
import { Controller, useForm } from "react-hook-form"

import { Section } from "../Section"

import { DefinitionPanel } from "./DefinitionPanel"

import type { ResolvedRestCallActionInstance } from "@/domain/entity/node/actionInstance"
import type { NodeId } from "@/domain/entity/node/node"
import type { RestCallActionParameter } from "@/domain/entity/action/actionParameter"

import { HTTP_METHODS, type HttpMethod } from "@/utils/http"
import { TextareaAutosize } from "@/ui/components/common/TextareaAutosize"
import { MethodChip } from "@/ui/components/common/MethodChip"
import {
  updateActionInstance,
  updateUserDefinedAction,
} from "@/ui/adapter/command"
import { applyUpdate } from "@/ui/utils/applyUpdate"
import { isResourceAction } from "@/domain/entity/action/identifier"
import { Button } from "@/ui/components/common/Button"
import {
  FormModal,
  FormModalContent,
  useFormRef,
} from "@/ui/lib/common/FormModal"
import { FormItem } from "@/ui/components/FormItem"
import { TextInput } from "@/ui/components/common/TextInput"
import { Select } from "@/ui/components/common/Select"

type FormData = {
  method: HttpMethod
  path: string
}

type Props = {
  nodeId: NodeId
  ai: ResolvedRestCallActionInstance
}

export const HeaderSection = ({ nodeId, ai }: Props) => {
  const actionBaseParams = ai.action.schema.base as RestCallActionParameter

  const { handleSubmit, register, control } = useForm<FormData>({
    defaultValues: {
      method: actionBaseParams.method,
      path: actionBaseParams.path,
    },
  })

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

  const ref = useFormRef()

  const onSubmit = handleSubmit((data) => {
    if (ai.actionIdentifier.resourceType === "user_defined") {
      updateUserDefinedAction(ai.actionIdentifier, data)
      ref.current?.close()
    }
  })

  return (
    <Section>
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <div className="flex grow items-center gap-3">
            <MethodChip size="lg">{ai.instanceParameter.method!}</MethodChip>{" "}
            <div className="text flex grow items-baseline gap-4 leading-none">
              {ai.instanceParameter.path!}
            </div>
          </div>
          {ai.actionIdentifier.resourceType === "user_defined" && (
            <div>
              <FormModal
                title="呼び出し情報を編集する"
                description="API呼び出しの情報を編集します"
                ref={ref}
                modal={
                  <FormModalContent onSubmit={onSubmit} okLabel="更新する">
                    <div className="flex flex-col gap-4">
                      <FormItem id="method" label="メソッド">
                        <Controller
                          name="method"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <Select
                              items={HTTP_METHODS.map((method) => ({
                                id: method,
                                label: method,
                              }))}
                              value={value}
                              onChange={(value) => onChange(value)}
                            />
                          )}
                        />
                      </FormItem>
                      <FormItem id="description" label="パス">
                        <TextInput {...register("path")} />
                      </FormItem>
                    </div>
                  </FormModalContent>
                }
              >
                <Button prefix={FiEdit} size="sm" theme="secondary">
                  編集する
                </Button>
              </FormModal>
            </div>
          )}
        </div>
        <div className="relative">
          <TextareaAutosize
            className="w-[calc(100%+16px)] -translate-x-2 resize-none rounded border border-transparent px-[7px] py-1 text-sm transition hover:border-slate-200 focus:border-slate-200 focus:outline-none"
            value={
              0 < ai.description.length ? ai.description : ai.action.description
            }
            onChange={(e) => handleUpdateDescription(e.target.value)}
            placeholder="説明を追加"
          />
        </div>
        {isResourceAction(ai.action) && <DefinitionPanel action={ai.action} />}
      </div>
    </Section>
  )
}
