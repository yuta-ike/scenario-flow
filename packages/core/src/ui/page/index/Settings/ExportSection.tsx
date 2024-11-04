import { ExportForm } from "./ExportForm"

import { Section } from "@/ui/components/Section"
import { Button } from "@/ui/components/common/Button"
import { FormModal } from "@/ui/lib/common/FormModal"

export const ExportSection = () => {
  const footer = [
    <FormModal
      key="export"
      title="エクスポート"
      description="作成したシナリオファイルをエクスポートします"
      modal={<ExportForm />}
    >
      <Button type="button">エクスポート</Button>
    </FormModal>,
  ]

  return (
    <Section title="エクスポート" footer={footer}>
      <p className="text-sm text-slate-600">
        作成したシナリオファイルをエクスポートします
      </p>
    </Section>
  )
}
