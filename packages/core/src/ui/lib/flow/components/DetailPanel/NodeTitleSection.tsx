import React, { useRef, useState } from "react"
import { FiTrash, FiChevronsRight } from "react-icons/fi"
import { TbArrowFork, TbArrowLoopRight, TbMinus } from "react-icons/tb"
import { atom, useAtom } from "jotai"
import clsx from "clsx"
import { flushSync } from "react-dom"

import { MagicVariableButton } from "./MagicVariableButton"

import type { Expression } from "@/domain/entity/value/expression"
import type { Node } from "@/domain/entity/node/node"

import {
  isNodeConfigConditionSet,
  isNodeConfigLoopSet,
  type NodeId,
} from "@/domain/entity/node/node"
import { deleteNode, updateNode, updateNodeConfig } from "@/ui/adapter/command"
import { useNode, useParentNodeEnvironment } from "@/ui/adapter/query"
import { IconButton } from "@/ui/components/common/IconButton"
import { TextareaAutosize } from "@/ui/components/common/TextareaAutosize"
import { useResetFocusNodeId } from "@/ui/state/focusedNodeId"
import { ToolButton } from "@/ui/components/common/ToolButton"
import { parseNumber } from "@/utils/number"
import { Collapsible } from "@/ui/components/common/Collapsible"

const descriptionAreaExpandedAtom = atom(false)

type NodeTitleSectionProps = {
  nodeId: NodeId
}

export const NodeTitleSection = ({ nodeId }: NodeTitleSectionProps) => {
  const node = useNode(nodeId)

  const [showLoopOrConditionConfig, setShowLoopOrConditionConfig] =
    useState(false)

  const updateNodeName = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNode(nodeId, { name: e.target.value })
  }

  const updateNodeDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNode(nodeId, { description: e.target.value })
  }

  const reset = useResetFocusNodeId()

  const [descriptionAreaExpanded, setDescriptionAreaExpanded] = useAtom(
    descriptionAreaExpandedAtom,
  )
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  return (
    <div>
      <div className="flex items-center gap-2 border-b border-b-slate-200 pl-4 pr-2">
        <div className="relative grow py-2 pr-2">
          <div>
            <TextareaAutosize
              className="w-[calc(100%+16px)] -translate-x-2 resize-none rounded border border-transparent bg-transparent px-[7px] py-1 text-sm font-bold transition placeholder:font-normal hover:border-slate-200 focus:border-slate-200 focus:outline-none"
              value={node.name}
              onChange={updateNodeName}
              placeholder="タイトルを追加"
            />
          </div>
        </div>
        <ToolButton
          icon={TbArrowFork}
          label="実行条件"
          size="sm"
          highlighted={isNodeConfigConditionSet(node)}
          onClick={() => setShowLoopOrConditionConfig((prev) => !prev)}
        />
        <ToolButton
          icon={TbArrowLoopRight}
          label="リトライ"
          size="sm"
          highlighted={isNodeConfigLoopSet(node)}
          onClick={() => setShowLoopOrConditionConfig((prev) => !prev)}
        />
        <ToolButton
          icon={FiTrash}
          label="削除"
          size="sm"
          onClick={() => deleteNode(nodeId)}
        />
        <hr className="h-auto w-px self-stretch border-l border-l-slate-200" />
        <div className="shrink-0 py-1">
          <IconButton icon={FiChevronsRight} label="とじる" onClick={reset} />
        </div>
      </div>

      <section className="relative border-b border-b-slate-200 px-4 py-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="shrink-0 text-xs font-bold text-slate-600">説明</h3>
            <button
              type="button"
              className={clsx(
                "block grow text-start text-xs",
                descriptionAreaExpanded && "hidden",
              )}
              onClick={() => {
                flushSync(() => setDescriptionAreaExpanded(true))
                descriptionRef.current?.focus()
              }}
            >
              {0 < node.description.length ? (
                node.description
              ) : (
                <span className="text-slate-400">クリックして入力</span>
              )}
            </button>
            <div
              className={clsx(
                "ml-auto shrink-0",
                !descriptionAreaExpanded && "hidden",
              )}
            >
              <IconButton
                size="sm"
                variant="segmented"
                icon={TbMinus}
                label="小さく表示する"
                onClick={() => setDescriptionAreaExpanded(false)}
              />
            </div>
          </div>
          <Collapsible show={descriptionAreaExpanded}>
            <TextareaAutosize
              className="resize-none rounded border border-transparent px-[7px] py-1 text-[13px] transition hover:border-slate-200 focus:border-slate-200 focus:outline-none"
              value={node.description}
              onChange={updateNodeDescription}
              placeholder="説明を追加"
              ref={descriptionRef}
            />
          </Collapsible>
        </div>
      </section>
      <Collapsible show={showLoopOrConditionConfig}>
        <ExpandedSection node={node} />
      </Collapsible>
    </div>
  )
}

const ExpandedSection = ({ node }: { node: Node }) => {
  const updateNodeCondition = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeConfig(node.id, {
      ...node.config,
      condition: e.target.value as Expression,
    })
  }

  const updateNodeConfigLoopMaxRetries = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    updateNodeConfig(node.id, {
      ...node.config,
      loop: {
        ...node.config.loop,
        maxRetries: parseNumber(e.target.value) ?? 0,
      },
    })
  }

  const updateNodeConfigLoopInterval = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    updateNodeConfig(node.id, {
      ...node.config,
      loop: {
        ...node.config.loop,
        interval: { unit: "s", value: parseNumber(e.target.value) ?? 0 },
      },
    })
  }

  const updateNodeConfigLoopMaxElapsedTime = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    updateNodeConfig(node.id, {
      ...node.config,
      loop: {
        ...node.config.loop,
        maxElapsedTime: { unit: "s", value: parseNumber(e.target.value) ?? 0 },
      },
    })
  }

  const environment = useParentNodeEnvironment(node.id)

  return (
    <div className="flex flex-col gap-4 border-b border-b-slate-200 p-4 empty:hidden">
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-bold text-slate-600">実行条件</h3>
        <div className="flex items-baseline gap-2">
          <div className="relative flex grow items-baseline rounded border border-slate-200">
            <div className="shrink-0 px-2 text-slate-400">if</div>
            <input
              type="text"
              placeholder="実行条件"
              className="w-full grow bg-transparent py-1 pr-0 text-sm placeholder:text-slate-300 focus:outline-none"
              value={node.config.condition ?? ""}
              onChange={updateNodeCondition}
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <MagicVariableButton
                environment={environment}
                currentNodeId={node.id}
                onInsert={(inserted) => {}}
              />
            </div>
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-bold text-slate-600">リトライ条件</h3>
        <div className="flex flex-wrap gap-2">
          <div className="relative flex items-baseline rounded border border-slate-200">
            <div className="shrink-0 border-r border-r-slate-200 px-1.5 text-xs text-slate-400">
              最大数
            </div>
            <input
              type="number"
              onWheel={(e) => e.preventDefault()}
              value={node.config.loop?.maxRetries ?? 0}
              onChange={updateNodeConfigLoopMaxRetries}
              min={0}
              placeholder="間隔"
              className="w-[50px] grow bg-transparent py-1 pr-2 text-right text-sm placeholder:text-slate-300 focus:outline-none"
            />
            <div className="shrink-0 pr-2 text-xs text-slate-400">回</div>
          </div>
          <div className="relative flex items-baseline rounded border border-slate-200">
            <div className="shrink-0 border-r border-r-slate-200 px-1.5 text-xs text-slate-400">
              間隔
            </div>
            <input
              type="number"
              onWheel={(e) => e.preventDefault()}
              min={0}
              value={node.config.loop?.interval?.value ?? 0}
              onChange={updateNodeConfigLoopInterval}
              placeholder="間隔"
              className="w-[50px] grow bg-transparent py-1 pr-2 text-right text-sm placeholder:text-slate-300 focus:outline-none"
            />
            <div className="shrink-0 pr-2 text-xs text-slate-400">秒</div>
          </div>
          <div className="relative flex items-baseline rounded border border-slate-200">
            <div className="shrink-0 border-r border-r-slate-200 px-1.5 text-xs text-slate-400">
              間隔
            </div>
            <input
              type="number"
              onWheel={(e) => e.preventDefault()}
              min={0}
              value={node.config.loop?.maxElapsedTime?.value ?? 0}
              onChange={updateNodeConfigLoopMaxElapsedTime}
              placeholder="最大経過時間"
              className="w-[50px] grow bg-transparent py-1 pr-2 text-right text-sm placeholder:text-slate-300 focus:outline-none"
            />
            <div className="shrink-0 pr-2 text-xs text-slate-400">秒</div>
          </div>
        </div>
      </section>
    </div>
  )
}
