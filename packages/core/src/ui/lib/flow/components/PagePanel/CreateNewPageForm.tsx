import { useForm } from "react-hook-form"

import { FormModalContent, useCloseModal } from "@/ui/lib/common/FormModal"
import { TextInput } from "@/ui/components/common/TextInput"
import { FormItem } from "@/ui/components/FormItem"
import { addRoute } from "@/ui/adapter/command"

type FormData = {
  name: string
}

export const CreateNewPageForm = () => {
  const { handleSubmit, register } = useForm<FormData>()
  const close = useCloseModal()

  const onSubmit = handleSubmit((data) => {
    addRoute({
      description: "",
      path: [],
      page: `/${data.name}`,
      variables: [],
    })
    close()
  })

  return (
    <FormModalContent onSubmit={onSubmit}>
      <FormItem id="name" label="ページ名">
        <TextInput required {...register("name")} placeholder="新しいページ" />
        <p className="mt-1 text-xs text-slate-500">
          スラッシュでページを指定できます。
        </p>
      </FormItem>
    </FormModalContent>
  )
}
