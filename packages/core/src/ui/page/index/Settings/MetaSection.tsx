import { useForm } from "react-hook-form"

import { Button, Section, TextInput } from "@scenario-flow/ui"
import { useMeta } from "../../../adapter/query"
import { ParameterTable, TableRow } from "../../../lib/ParameterTable"
import { Updater, KVItem, applyUpdate } from "@scenario-flow/util"
import { toLocalVariableId, Expression } from "../../../../domain/entity"
import { updateRouteVariables } from "../../../adapter/command"

const getExtraColumns = (row: TableRow) => {
  if (row.value.startsWith("http")) {
    return "http"
  }
  if (row.value.startsWith("https")) {
    return "https"
  }
}

export const MetaSection = () => {
  const [meta, setMeta] = useMeta()

  const handleChangeRows = (update: Updater<KVItem[]>) => {
    setMeta({
      ...meta,
      runners: applyUpdate(update, meta.runners).filter(
        ({ key, value }) => 0 < key.length || 0 < value.length,
      ),
    })
  }

  const footer = [
    <Button type="submit" key="save">
      保存
    </Button>,
  ]

  return (
    <Section title="Runner" footer={footer}>
      <ParameterTable
        rows={meta.runners}
        headers={{
          key: "Name",
          value: "接続先",
          extra: "Type",
        }}
        setRows={handleChangeRows}
        placeholderKey="req"
        placeholderValue="http://localhost:8080"
        getExtraColumns={(value) =>
          value.startsWith("http") ? (
            <div className="mx-1 grid w-max place-items-center rounded-full border border-red-700 bg-red-100 px-3 py-1 leading-none text-red-700">
              http
            </div>
          ) : value.startsWith("grpc") ? (
            <div className="mx-1 grid w-max place-items-center rounded-full border border-blue-700 bg-blue-100 px-3 py-1 leading-none text-blue-700">
              grpc
            </div>
          ) : value.startsWith("postgres") ||
            value.startsWith("pg") ||
            value.startsWith("mysql") ||
            value.startsWith("my") ||
            value.startsWith("sqlite") ||
            value.startsWith("sq") ? (
            <div className="mx-1 grid w-max place-items-center rounded-full border border-green-700 bg-green-100 px-3 py-1 leading-none text-green-700">
              postgres
            </div>
          ) : (
            value.startsWith("mysql")
          )
        }
      />
    </Section>
  )
}
