import { TbFlag2, TbPlayerPlay } from "react-icons/tb"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { FiChevronsLeft } from "react-icons/fi"
import { type FormEvent } from "react"
import { atom, useSetAtom } from "jotai"

import { RunModalContent } from "../components/RunButton/RunModalContent"

import { StepItem } from "./StepItem"

import type { DragEndEvent } from "@dnd-kit/core"
import type { NodeId } from "@/domain/entity/node/node"

import { swapRoutePath, updteRoute } from "@/ui/adapter/command"
import { IconButton } from "@/ui/components/common/IconButton"
import { CustomModal } from "@/ui/components/common/CustomModal"
import { Button } from "@/ui/components/common/Button"
import { useFocusedRoute } from "@/ui/state/focusedRouteId"

export const showListViewAtom = atom(false)

// eslint-disable-next-line react-refresh/only-export-components
export const useSetShowListView = () => useSetAtom(showListViewAtom)

export const ListView = () => {
  const setShow = useSetAtom(showListViewAtom)

  return (
    <div className="h-full w-full opacity-100">
      <ListViewInner onClose={() => setShow(false)} />
    </div>
  )
}

const ListViewInner = ({ onClose }: { onClose: () => void }) => {
  const route = useFocusedRoute()

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over != null && active.id !== over.id) {
      swapRoutePath(route.id, active.id as NodeId, over.id as NodeId)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <section className="flex flex-col">
        <div className="flex w-full items-center justify-between pr-4">
          <div className="shrink-0 p-1">
            <IconButton
              label="とじる"
              icon={FiChevronsLeft}
              onClick={onClose}
            />
          </div>
          <hr className="h-auto w-px self-stretch border-r border-r-slate-200" />
          <div className="flex grow items-center gap-2 px-4 py-2">
            <div className="shrink-0">
              <TbFlag2
                size={20}
                style={{ color: route.color }}
                className="fill-current stroke-current"
              />
            </div>
            <form className="grow" onSubmit={handleSubmit}>
              <input
                key={route.name}
                name="name"
                className="w-full rounded border border-transparent bg-transparent px-[7px] py-1 text-slate-600 transition placeholder:font-normal hover:border-slate-200 focus:border-slate-200 focus:outline-none"
                defaultValue={route.name}
                placeholder="タイトルを追加"
                onBlur={(e) => {
                  handleUpdate(e.target.value)
                }}
              />
            </form>
          </div>
          <CustomModal modal={<RunModalContent initialSelected={[route.id]} />}>
            <Button size="sm" prefix={TbPlayerPlay}>
              テストを実行
            </Button>
          </CustomModal>
        </div>
      </section>
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <SortableContext
          items={route.path.map((node) => node.id)}
          strategy={verticalListSortingStrategy}
        >
          <section className="flex grow flex-col gap-2 overflow-y-auto border-y border-y-slate-200 bg-slate-50 px-2 py-4">
            {route.path.map((node, index) => (
              <StepItem key={node.id} node={node} index={index} />
            ))}
          </section>
        </SortableContext>
      </DndContext>
    </div>
  )
}
