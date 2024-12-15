import { TbFlag2 } from "react-icons/tb"
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
import { useState, type FormEvent } from "react"

import { PathChip } from "./PathChip"
import { StepItem } from "./StepItem"

import { useFocusedRoute } from "@/ui/state/focusedRouteId"
import { fill } from "@/utils/placeholder"
import { updteRoute } from "@/ui/adapter/command"
import { IconButton } from "@/ui/components/common/IconButton"

export const ListView = () => {
  const [show, setShow] = useState(false)

  if (!show) {
    return null
  } else {
    return <ListViewInner onClose={() => setShow(false)} />
  }
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

  return (
    <div className="flex h-full w-[600px] flex-col gap-1">
      <section className="flex flex-col">
        <div className="flex w-full items-center justify-between">
          <div className="shrink-0 p-1">
            <IconButton
              label="とじる"
              icon={FiChevronsLeft}
              onClick={onClose}
            />
          </div>
          <hr className="h-auto w-px self-stretch border-r border-r-slate-200" />
          <div className="grow -translate-x-1 px-2">
            <PathChip path={fill(route.page, "/")} />
          </div>
          <div className="px-2 text-xs text-slate-400">{route.id}</div>
        </div>
        <div className="flex items-center gap-4 border-t border-t-slate-200 px-4 py-2">
          <div className="shrink-0">
            <TbFlag2
              size={24}
              style={{ color: route.color }}
              className="fill-current stroke-current"
            />
          </div>
          <form className="grow" onSubmit={handleSubmit}>
            <input
              key={route.name}
              name="name"
              className="w-[calc(100%+16px)] -translate-x-2 resize-none rounded border border-transparent bg-transparent px-[7px] py-1 text-lg text-slate-600 transition placeholder:font-normal hover:border-slate-200 focus:border-slate-200 focus:outline-none"
              defaultValue={route.name}
              placeholder="タイトルを追加"
              onBlur={(e) => {
                handleUpdate(e.target.value)
              }}
            />
          </form>
        </div>
      </section>
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={() => {
          // noop
        }}
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
