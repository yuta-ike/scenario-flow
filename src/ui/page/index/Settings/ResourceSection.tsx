import { AddOrUpdateResourceForm } from "./AddOrUpdateResourceForm"
import { ResourceDetail } from "./ResourceDetail"

import { Section } from "@/ui/components/Section"
import { useResources } from "@/ui/adapter/query"
import { Button } from "@/ui/components/common/Button"
import { FormModal } from "@/ui/lib/common/FormModal"
import { LOCATION_TYPE_MAP } from "@/domain/entity/resource/locationType"
import { Drawer } from "@/ui/components/common/Drawer"

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
                {LOCATION_TYPE_MAP.get(resource.locationType)?.label}
              </div>
            </li>
          </Drawer>
        ))}
      </ol>
    </Section>
  )
}
