import { useEffect, useMemo, useRef } from "react"
import {
  SortableContext,
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

import type { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core"
import type { CellContext, ColumnDef, Row } from "@tanstack/react-table"
import { type Id, genId } from "@scenario-flow/util"

export type TableRow = {
  id: Id
  key: string
  values: string[]
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

const genPlaceholderRow = (valuesCount: number) => ({
  id: genId(),
  key: "",
  values: Array<string>(valuesCount).fill(""),
  isTmp: true,
})

type ParameterTableProps = {
  rows: TableRow[]
  headers: string[]
  updateKey: (id: string, value: string, isNew: boolean) => void
  updateValue: (
    id: string,
    index: number,
    value: string,
    isNew: boolean,
  ) => void
  placeholderKey?: string
  placeholderValue?: string
}
export const GlobalVariableTable = ({
  rows,
  headers,
  updateKey,
  updateValue,
  placeholderKey,
  placeholderValue,
}: ParameterTableProps) => {
  const updateKeyRef = useRef(updateKey)
  useEffect(() => {
    updateKeyRef.current = updateKey
  }, [updateKey])

  const updateValueRef = useRef(updateValue)
  useEffect(() => {
    updateValueRef.current = updateValue
  }, [updateValue])

  const updateKeyHandler = useRef(
    (id: string, value: string, isNew: boolean) => {
      updateKeyRef.current(id, value, isNew)
    },
  )

  const updateValueHandler = useRef(
    (id: string, index: number, value: string, isNew: boolean) => {
      updateValueRef.current(id, index, value, isNew)
    },
  )

  const columns = useMemo<ColumnDef<TableRow & { isTmp: boolean }>[]>(() => {
    return [
      {
        id: "drag-handle",
        cell: ({ row }) => (
          <RowDragHandleCell
            rowId={row.id}
            disabled={row.getValue<boolean>("isTmp")}
          />
        ),
        header: () => "",
        size: 24,
      },
      {
        accessorKey: "key",
        cell: ({ getValue, cell, row }) => (
          <input
            type="text"
            value={getValue<string>()}
            placeholder={placeholderKey}
            className="w-full bg-transparent p-2 pr-0 placeholder:text-slate-300 focus:outline-none"
            onChange={(e) =>
              updateKeyHandler.current(
                cell.row.id,
                e.target.value,
                row.getValue("isTmp"),
              )
            }
          />
        ),
        header: () => <div>変数名</div>,
        size: 120,
      },
      ...headers.map((header, i) => ({
        accessorKey: `values`,
        cell: ({
          getValue,
          cell,
          row,
        }: CellContext<
          TableRow & {
            isTmp: boolean
          },
          unknown
        >) => (
          <div className="relative" key={`${cell.row.id}-${i}`}>
            <input
              type="text"
              value={getValue<string[]>()[i]}
              placeholder={placeholderValue}
              className="w-full bg-transparent p-2 pr-0 placeholder:text-slate-300 focus:outline-none"
              onChange={(e) =>
                updateValueHandler.current(
                  cell.row.id,
                  i,
                  e.target.value,
                  row.getValue("isTmp"),
                )
              }
            />
          </div>
        ),
        header: () => <div>{header}</div>,
      })),
      {
        accessorKey: "isTmp",
        enableHiding: true,
      },
    ]
  }, [placeholderKey, placeholderValue, headers])

  const table = useReactTable({
    data: useMemo(
      () =>
        [
          ...rows.map((row) => ({ ...row, isTmp: false })),
          genPlaceholderRow(headers.length),
        ].flat(1),
      [rows, headers],
    ),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    enableColumnFilters: true,
    state: {
      columnVisibility: {
        isTmp: false,
      },
    },
  })

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => rows.map(({ id }) => id),
    [rows],
  )

  const handleDragEnd = (event: DragEndEvent) => {
    // const { active, over } = event
    // if (over != null && active.id !== over.id) {
    //   setRows?.((data) => {
    //     const oldIndex = dataIds.indexOf(active.id)
    //     const newIndex = dataIds.indexOf(over.id)
    //     return arrayMove(data, oldIndex, newIndex) //this is just a splice util
    //   })
    // }
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
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className="border border-l-0 border-[#EEEEEE] bg-slate-50 px-2 py-1 text-start text-xs font-normal first:border-l first:border-r-0"
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
