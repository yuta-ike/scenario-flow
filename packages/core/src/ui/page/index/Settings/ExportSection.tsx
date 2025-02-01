import { Button, FormModal, Section } from "@scenario-flow/ui"
import { ExportForm } from "./ExportForm"

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
