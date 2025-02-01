import { LOCATION_TYPE_MAP } from "../../../../domain/entity"
import { useResources } from "../../../adapter/query"
import { AddOrUpdateResourceForm } from "./AddOrUpdateResourceForm"
import { ResourceDetail } from "./ResourceDetail"

import { Button, Section, Drawer, FormModal } from "@scenario-flow/ui"

export const ResourceSection = () => {
  const resources = useResources()

  const addResourceButton = (
    <FormModal
      key="add"
      title="OpenAPIファイルのインポート"
      description="OpenAPIファイルをインポートする"
      modal={<AddOrUpdateResourceForm type="create" />}
    >
      <Button key="save">追加</Button>
    </FormModal>
  )

  return (
    <Section title="外部リソース" footer={[addResourceButton]}>
      <ol className="pl-4">
        {resources.map((resource) => (
          <Drawer
            key={resource.id}
            title={resource.name}
            description=""
            modal={<ResourceDetail resourceId={resource.id} />}
          >
            <li className="list-disc text-lg">
              {resource.name}{" "}
              <div className="ml-1 inline rounded-sm bg-slate-400 p-1 text-xs text-white">
                {LOCATION_TYPE_MAP.get(resource.location.locationType)?.label}
              </div>
            </li>
          </Drawer>
        ))}
      </ol>
    </Section>
  )
}
