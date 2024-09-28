import { useGlobalVariableMatrix } from "@/ui/adapter/query"
import { Section } from "@/ui/components/Section"

export const VariableSection = () => {
  const matrix = useGlobalVariableMatrix()

  // TODO: 実装

  return (
    <Section title="グローバル変数（WIP）">
      <pre className="font-mono text-sm">{JSON.stringify(matrix)}</pre>
    </Section>
  )
}
