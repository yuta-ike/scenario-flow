import React from "react"
import { FiUpload } from "react-icons/fi"

import { ApiCallTile } from "../BlockMenu/ApiCallTile"

import { AddOrUpdateResourceForm } from "./AddOrUpdateResourceForm"

import { Button, FormModal } from "@scenario-flow/ui"
import { jsonToYaml, Json } from "@scenario-flow/util"
import { ResourceId, getIdentifier } from "../../../../domain/entity"
import { useResource, useActions } from "../../../adapter/query"
import { Editor2 } from "../../../lib/editor/Editor2"

type SectionProps = {
  title?: string
  children?: React.ReactNode
}

const Section = ({ title, children }: SectionProps) => {
  return (
    <section className="flex flex-col gap-2">
      {title != null && (
        <h3 className="text-sm font-bold text-slate-600">{title}</h3>
      )}
      <div>{children}</div>
    </section>
  )
}

type ResourceDetailProps = {
  resourceId: ResourceId
}

export const ResourceDetail = ({ resourceId }: ResourceDetailProps) => {
  const resource = useResource(resourceId)

  const actions = useActions().filter(
    (action) =>
      action.resourceType === "resource" &&
      action.resourceIdentifier.resourceId === resourceId,
  )

  const uploadButton = (
    <FormModal
      title="OpenAPIファイルの再アップロード"
      description="OpenAPIファイルを入れ替える"
      modal={
        <AddOrUpdateResourceForm
          type="update"
          resourceId={resource.id}
          name={resource.name}
          description={resource.description}
        />
      }
    >
      <Button theme="secondary" prefix={FiUpload}>
        再アップロード
      </Button>
    </FormModal>
  )

  return (
    <div className="flex flex-col gap-4">
      <div>{resource.description}</div>
      <Section>
        <div className="py-4">{uploadButton}</div>
      </Section>
      <Section title={`追加されたアクション (${actions.length})`}>
        <div className="grid max-h-[400px] grid-cols-2 gap-2 overflow-y-auto">
          {actions.map((action) => (
            <ApiCallTile
              key={action.id}
              actionIdentifier={getIdentifier(action)}
            />
          ))}
        </div>
      </Section>
      <Section title="リソースプレビュー">
        <div>
          <Editor2
            initValue={jsonToYaml(resource.content as unknown as Json)}
            lang="yaml"
            className="h-[400px]"
            readOnly
          />
        </div>
      </Section>
    </div>
  )
}
