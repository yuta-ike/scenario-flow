import { useEffect, useMemo, useRef } from "react"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { CSS } from "@dnd-kit/utilities"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers"
import { HiMenuAlt4 } from "react-icons/hi"
import clsx from "clsx"
import { TbAlertCircleFilled } from "react-icons/tb"
import { FiInfo } from "react-icons/fi"

import type { SetStateAction } from "jotai"
import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core"
import type { ColumnDef, Row } from "@tanstack/react-table"
import { Tooltip, RichInput } from "@scenario-flow/ui"
import { associateWithList, genId, getUpdateOps } from "@scenario-flow/util"
import {
  NodeId,
  ResolvedEnvironment,
  DataType,
  getVariableName,
} from "../../../domain/entity"
import { DataTypeIcon } from "../../components/common/getDataTypeIcon"

export type TableRow = {
  id: string
  key: string
  value: string
  description?: string
  required?: boolean
  defined?: boolean
}

const RowDragHandleCell = ({
  rowId,
  disabled = false,
}: {
  rowId: string
  disabled?: boolean
}) => {
  const { attributes, listeners } = useSortable({
    id: rowId,
  })

  return (
    <button
      type="button"
      {...attributes}
      {...listeners}
      disabled={disabled}
      className="grid place-items-center text-slate-300 transition hover:text-slate-600 disabled:invisible group-data-[dragging=true]:text-slate-600"
    >
      <HiMenuAlt4 />
    </button>
  )
}

const DraggableRow = ({ row }: { row: Row<TableRow> }) => {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <tr
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1 : 0,
        position: "relative",
      }}
      className="group"
      data-dragging={isDragging}
    >
      {row.getVisibleCells().map((cell, i) => (
        <td
          key={cell.id}
          style={{ width: cell.column.getSize() }}
          className={clsx(
            "border-y border-[#EEEEEE] bg-white focus-within:bg-slate-50 group-data-[dragging=true]:bg-slate-50",
            i === 0
              ? "border-l px-1.5 py-2 pr-0"
              : "border-l border-r border-l-transparent focus-within:border-[#EEEEEE]",
          )}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  )
}

const genPlaceholderRow = () => ({
  id: genId(),
  key: "",
  value: "",
  isTmp: true,
})

type ParameterTableProps = {
  rows: TableRow[]
  setRows?: (update: SetStateAction<TableRow[]>) => void
  placeholderKey?: string
  placeholderValue?: string
  currentNodeId?: NodeId
  environment?: ResolvedEnvironment
  lockNewRow?: boolean
  headers?: {
    key: string
    value: string
    extra?: string
  }
  lang?: "template" | "expression"
  getExtraColumns?: (value: TableRow["value"]) => React.ReactNode
}
export const ParameterTable = ({
  rows,
  setRows,
  placeholderKey,
  placeholderValue,
  currentNodeId,
  environment,
  headers,
  lockNewRow = false,
  lang = "template",
  getExtraColumns,
}: ParameterTableProps) => {
  const setRowsRef = useRef(setRows)
  useEffect(() => {
    setRowsRef.current = setRows
  }, [setRows])

  const updateRowHandler = useRef(
    (id: string, target: "key" | "value", value: string) => {
      if (setRowsRef.current == null) {
        return
      }
      const ops = getUpdateOps(setRowsRef.current)
      ops.upsertWhen({
        when: (item) => item.id === id,
        update: (item) => ({ ...item, [target]: value }),
        create: () => ({ id, key: "", value: "", [target]: value }),
      })
    },
  )

  const columns = useMemo<ColumnDef<TableRow & { isTmp: boolean }>[]>(() => {
    const environmentMap = associateWithList(
      environment ?? [],
      ({ variable: { boundIn } }) =>
        boundIn === "global"
          ? "global"
          : boundIn.type === "node"
            ? boundIn.node.name
            : boundIn.route.name,
    )

    return [
      {
        id: "drag-handle",
        header: "",
        cell: ({ row }) => (
          <RowDragHandleCell
            rowId={row.id}
            disabled={row.getValue<boolean>("isTmp")}
          />
        ),
        size: 24,
      },
      {
        accessorKey: "key",
        header: () => headers?.key,
        cell: ({ getValue, cell, row }) => (
          <div className="relative flex w-full items-center gap-2 pr-1">
            <input
              type="text"
              value={getValue<string>()}
              placeholder={placeholderKey}
              className="grow bg-transparent p-2 pr-0 placeholder:text-slate-300 focus:outline-none"
              onChange={(e) =>
                updateRowHandler.current(cell.row.id, "key", e.target.value)
              }
            />
            <div className="flex shrink-0 items-center gap-0.5">
              {row.getValue<boolean | undefined>("defined") === false && (
                <Tooltip label="スキーマで定義されていないプロパティです">
                  <button
                    type="button"
                    className="shrink-0 cursor-pointer rounded p-0.5 hover:bg-slate-200"
                  >
                    <TbAlertCircleFilled
                      size={18}
                      className="text-orange-400"
                    />
                  </button>
                </Tooltip>
              )}
              {row.getValue<string | undefined>("description") != null && (
                <Tooltip
                  label={row.getValue<string | undefined>("description")!}
                >
                  <button
                    type="button"
                    className="shrink-0 cursor-pointer rounded p-0.5 hover:bg-slate-200"
                  >
                    <FiInfo size={18} className="fill-slate-600 text-white" />
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        ),
        size: 80,
      },
      {
        accessorKey: "value",
        header: headers?.value,
        cell: ({ getValue, cell, row }) => {
          const value = getValue<string>()
          return (
            <div className="relative flex items-center gap-2">
              <div className="ml-2 grid shrink-0 place-items-center text-slate-600 empty:hidden">
                <DataTypeIcon
                  type={row.getValue<DataType | undefined>("dataType")}
                  required={
                    row.getValue<boolean | undefined>("required") === true
                  }
                />
              </div>
              <RichInput
                value={value}
                placeholder={placeholderValue}
                onChange={(value) =>
                  updateRowHandler.current(cell.row.id, "value", value)
                }
                suggests={environmentMap
                  .entries()
                  .map(([boundInName, binds]) => {
                    return {
                      title: boundInName,
                      variables: binds.map(({ variable }) => ({
                        name: getVariableName(variable),
                        value: variable.name,
                      })),
                    }
                  })
                  .toArray()}
                lang={lang}
                headless
              />
            </div>
          )
        },
        size: 1000,
      },
      {
        accessorKey: "extra",
        header: headers?.extra,
        enableHiding: true,
        cell: ({ row }) => getExtraColumns?.(row.getValue("value")),
      },
      {
        accessorKey: "isTmp",
        enableHiding: true,
      },
      {
        accessorKey: "description",
        enableHiding: true,
      },
      {
        accessorKey: "defined",
        enableHiding: true,
      },
      {
        accessorKey: "required",
        enableHiding: true,
      },
      {
        accessorKey: "dataType",
        enableHiding: true,
      },
    ]
  }, [
    currentNodeId,
    environment,
    placeholderKey,
    placeholderValue,
    headers?.key,
    headers?.value,
  ])

  const data = useMemo(
    () =>
      [
        ...rows.map((row) => ({ ...row, isTmp: false })),
        lockNewRow ? [] : genPlaceholderRow(),
      ].flat(),
    [lockNewRow, rows],
  )

  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    enableColumnFilters: true,
    state: {
      columnVisibility: {
        isTmp: false,
        description: false,
        defined: false,
        required: false,
        dataType: false,
        extra: getExtraColumns != null,
      },
    },
  })

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => rows.map(({ id }) => id),
    [rows],
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over != null && active.id !== over.id) {
      setRows?.((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex) //this is just a splice util
      })
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <table className="w-full text-sm">
        <thead className={clsx(headers == null && "sr-only")}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className={clsx(
                    "border border-l-0 border-[#EEEEEE] bg-slate-50 px-2 py-1 text-start text-xs font-normal text-slate-500 first:border-l",
                    header.id === "drag-handle" ? "border-r-0" : "",
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          <SortableContext
            items={dataIds}
            strategy={verticalListSortingStrategy}
          >
            {table.getRowModel().rows.map((row) => (
              <DraggableRow key={row.id} row={row} />
            ))}
          </SortableContext>
        </tbody>
      </table>
    </DndContext>
  )
}
