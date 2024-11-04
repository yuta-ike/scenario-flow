import { useForm } from "react-hook-form"

import { Section } from "@/ui/components/Section"
import { Button } from "@/ui/components/common/Button"
import { TextInput } from "@/ui/components/common/TextInput"
import { useMeta } from "@/ui/adapter/query"

type FormData = {
  endpoint: string
}

export const MetaSection = () => {
  const [meta, setMeta] = useMeta()

  const {
    register,
    formState: { isDirty },
    handleSubmit,
  } = useForm<FormData>({
    defaultValues: {
      endpoint: meta.endpoint,
    },
  })

  const onSubmit = handleSubmit((data) => {
    setMeta((prev) => ({ ...prev, endpoint: data.endpoint }))
  })

  const footer = [
    <Button type="submit" key="save" disabled={!isDirty}>
      保存
    </Button>,
  ]

  return (
    <form onSubmit={onSubmit}>
      <Section title="エンドポイント" footer={footer}>
        <TextInput
          width="md"
          placeholder="https://example.com"
          {...register("endpoint")}
        />
      </Section>
    </form>
  )
}
