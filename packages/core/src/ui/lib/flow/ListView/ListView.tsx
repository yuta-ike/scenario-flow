import { TbFlag2, TbPlayerPlay } from "react-icons/tb"
import { FiChevronsLeft } from "react-icons/fi"
import { useCallback, type FormEvent } from "react"
import { atom, useAtom } from "jotai"

import { RunModalContent } from "../components/RunButton/RunModalContent"
import { ParameterTable } from "../../ParameterTable"

import { StepItem } from "./StepItem"
import { useSetShowListView } from "./showListViewAtom"

import type { Updater } from "@tanstack/react-table"
import type { RouteId } from "@/domain/entity/route/route"
import type { KVItem } from "../../kv"
import type { Expression } from "@/domain/entity/value/expression"

import { updateRouteVariables, updteRoute } from "@/ui/adapter/command"
import { IconButton } from "@/ui/components/common/IconButton"
import { CustomModal } from "@/ui/components/common/CustomModal"
import { Button } from "@/ui/components/common/Button"
import { useFocusedRoute } from "@/ui/state/focusedRouteId"
import { useRoute } from "@/ui/adapter/query"
import { applyUpdate } from "@/ui/utils/applyUpdate"
import { toLocalVariableId } from "@/domain/entity/variable/variable.util"

const tabAtom = atom<"variables" | "steps">("variables")

export const ListView = () => {
  const setShow = useSetShowListView()

  const handleClose = useCallback(() => setShow(false), [setShow])

  return (
    <div className="h-full w-full bg-white opacity-100">
      <ListViewInner onClose={handleClose} />
    </div>
  )
}

const ListViewInner = ({ onClose }: { onClose: () => void }) => {
  const route = useFocusedRoute()
  const [tab, setTab] = useAtom(tabAtom)

  if (route == null) {
    return null
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // @ts-expect-error
    const name: string = e.currentTarget.name.value
    handleUpdate(name)
  }

  const handleUpdate = (name: string) => {
    updteRoute(route.id, { name })
  }

  return (
    <div className="flex h-full flex-col">
      <section className="flex flex-col">
        <div className="flex w-full items-center justify-between">
          <div className="shrink-0">
            <IconButton
              label="とじる"
              icon={FiChevronsLeft}
              onClick={onClose}
            />
          </div>
          <hr className="h-auto w-px self-stretch border-r border-r-slate-200" />
          <div className="flex grow items-center gap-2 px-2 py-2">
            <div className="shrink-0">
              <TbFlag2
                style={{ color: route.color }}
                className="fill-current stroke-current"
              />
            </div>
            <form className="grow" onSubmit={handleSubmit}>
              <input
                key={route.name}
                name="name"
                className="w-full rounded border border-transparent bg-transparent px-[7px] py-1 text-sm text-slate-600 transition placeholder:font-normal hover:border-slate-200 focus:border-slate-200 focus:outline-none"
                defaultValue={route.name}
                placeholder="タイトルを追加"
                onBlur={(e) => {
                  handleUpdate(e.target.value)
                }}
              />
            </form>
          </div>
          <div className="shrink-0 pr-2">
            <CustomModal
              modal={<RunModalContent initialSelected={[route.id]} />}
            >
              <Button size="sm" prefix={TbPlayerPlay}>
                テストを実行
              </Button>
            </CustomModal>
          </div>
        </div>
      </section>
      <div className="flex w-full items-center gap-1 overflow-x-auto border-y border-y-slate-200 bg-slate-50 pb-0 pr-4">
        <TabButton
          selected={tab === "variables"}
          onClick={() => setTab("variables")}
        >
          変数
        </TabButton>
        <TabButton selected={tab === "steps"} onClick={() => setTab("steps")}>
          ステップ
        </TabButton>
      </div>
      <section className="flex grow flex-col overflow-y-auto">
        {tab === "variables" ? (
          <div className="flex min-h-[200px] flex-col gap-2 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500">シナリオ変数</h3>
            </div>
            <RouteVariablesParameterTable routeId={route.id} />
          </div>
        ) : (
          <div className="flex flex-col gap-2 bg-slate-100 px-2 py-4">
            {route.path.map((nodeId, index) => (
              <StepItem key={nodeId} nodeId={nodeId} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

type TabButtonProps = {
  onClick: () => void
  selected: boolean
  children: string
}

const TabButton = ({ children, onClick, selected }: TabButtonProps) => {
  return (
    <button
      type="button"
      data-selected={selected}
      onClick={onClick}
      className="relative border-y-2 border-y-transparent px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 data-[selected=true]:border-b-slate-600 data-[selected=true]:text-slate-800"
    >
      {children}
    </button>
  )
}

type RouteVariablesParameterTableProps = {
  routeId: RouteId
}

const RouteVariablesParameterTable = ({
  routeId,
}: RouteVariablesParameterTableProps) => {
  const route = useRoute(routeId)

  const handleChangeRows = (update: Updater<KVItem[]>) => {
    const updated = applyUpdate(
      update,
      route.variables.map(({ variable: { id, name }, value }) => ({
        id,
        key: name,
        value,
      })),
    )

    updateRouteVariables(
      routeId,
      updated.map(({ id, key, value }) => ({
        id: toLocalVariableId(id),
        name: key,
        value: value as Expression,
      })),
    )
  }

  return (
    <ParameterTable
      rows={route.variables
        .map(({ variable: { id, name }, value }) => ({
          id,
          key: name,
          value: value,
        }))
        .filter(({ key }) => 0 < key.length)}
      placeholderKey="変数名"
      placeholderValue="値"
      setRows={handleChangeRows}
    />
  )
}
