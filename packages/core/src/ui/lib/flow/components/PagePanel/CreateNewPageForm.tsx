import { useForm } from "react-hook-form"

import {
  FormItem,
  FormModalContent,
  TextInput,
  useCloseModal,
} from "@scenario-flow/ui"
import { useStore } from "../../../provider"
import { addRoute } from "../../../../adapter/command"

type FormData = {
  name: string
}

export const CreateNewPageForm = () => {
  const store = useStore()

  const { handleSubmit, register } = useForm<FormData>()
  const close = useCloseModal()

  const onSubmit = handleSubmit((data) => {
    addRoute(store, {
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
