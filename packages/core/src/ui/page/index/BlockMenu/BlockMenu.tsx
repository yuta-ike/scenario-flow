import { Fragment, useState } from "react"

import { ApiCallTile } from "./ApiCallTile"
import { ResourceTile } from "./ResourceTile"

import { FileContent, associateWithList } from "@scenario-flow/util"
import { parseYaml } from "@scenario-flow/util/lib"
import { useStore } from "../../../lib/provider"
import { FormModal, FormModalContent } from "@scenario-flow/ui"
import {
  ResourceId,
  ActionSourceIdentifier,
  buildActionSourceIdentifier,
  display,
} from "../../../../domain/entity"
import {
  useResourceIds,
  useUserDefinedActionIds,
  useActionIds,
} from "../../../adapter/query"
import { FileInput } from "../../../components/common/FileInput"

type FormItemProps = {
  id: string
  label: string
  children: React.ReactNode
}

const FormItem = ({ id, label, children }: FormItemProps) => {
  return (
    <div className="flex flex-col gap-1 text-slate-700">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      {children}
    </div>
  )
}

const stripExtension = (name: string) => name.replace(/\.[^.]*$/, "")

export const BlockMenu = () => {
  const store = useStore()
  const resourceIds = useResourceIds()
  const userDefinedActionIds = useUserDefinedActionIds()

  const [isOpenModal, setOpenModal] = useState(false)

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<FileContent | null>(null)

  const handleFileUpload = (file: FileContent | null) => {
    if (file == null) {
      return
    }
    const fileName = stripExtension(file.name)
    if (name === "") {
      setName(fileName)
    }
    setFile(file)
    setOpenModal(true)
  }

  const handleSubmit = async () => {
    if (file == null) {
      return
    }

    const json = parseYaml(file.content)
    if (json.result === "error") {
      window.alert("ファイルの読み込みに失敗しました")
      return
    }
    // @ts-expect-error
    const result = await uploadOpenApiFile(
      store,
      name,
      description,
      file.path,
      json.value,
    )
    if (result.result === "error") {
      window.alert("OpenAPIファイルの形式が正しくありません")
      return
    }

    setName("")
    setDescription("")
    setFile(null)
    setOpenModal(false)
  }

  const identifiers = useActionIds()

  const identifierMap = associateWithList(
    identifiers.filter((identifier) => identifier.resourceType === "resource"),
    (identifier) => identifier.resourceIdentifier.resourceId,
  )

  const data: {
    titleOrResourceId: "ユーザー定義アクション" | ResourceId
    actionIdentifiers: ActionSourceIdentifier[]
  }[] = [
    {
      titleOrResourceId: "ユーザー定義アクション",
      actionIdentifiers: userDefinedActionIds.map((id) =>
        buildActionSourceIdentifier({
          resourceType: "user_defined",
          resourceIdentifier: { userDefinedActionId: id },
        }),
      ),
    },
    ...resourceIds.map((resourceId) => ({
      titleOrResourceId: resourceId,
      actionIdentifiers: identifierMap.get(resourceId) ?? [],
    })),
  ]

  return (
    <>
      <div className="flex max-h-full w-full grow flex-col gap-2 overflow-y-scroll">
        {data.map(({ titleOrResourceId, actionIdentifiers }) => (
          <Fragment key={titleOrResourceId}>
            {titleOrResourceId === "ユーザー定義アクション" ? (
              <h3 className="sticky top-0 grow bg-white px-2 py-1 text-xs text-slate-600">
                ユーザー定義アクション
              </h3>
            ) : (
              <ResourceTile resourceId={titleOrResourceId} />
            )}
            <div className="flex flex-col gap-1 px-1">
              {actionIdentifiers.map((identifier) => (
                <ApiCallTile
                  key={display(identifier)}
                  actionIdentifier={identifier}
                />
              ))}
            </div>
          </Fragment>
        ))}
        <div className="shrink-0" style={{ height: "32px" }} />
      </div>
      <FormModal
        title="OpenAPIファイルのインポート"
        description="OpenAPIファイルをインポートする"
        isOpen={isOpenModal}
        onOpenChange={setOpenModal}
        modal={
          <FormModalContent onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <FormItem id="name" label="識別名">
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm transition hover:bg-slate-50 focus:border-slate-500 focus:outline-none focus:hover:bg-white"
                />
              </FormItem>
              <FormItem id="file" label="スキーマファイル">
                <FileInput value={file} onChange={setFile} />
              </FormItem>
              <FormItem id="description" label="補足説明">
                <input
                  type="text"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm transition hover:bg-slate-50 focus:border-slate-500 focus:outline-none focus:hover:bg-white"
                />
              </FormItem>
            </div>
          </FormModalContent>
        }
      />
    </>
  )
}
