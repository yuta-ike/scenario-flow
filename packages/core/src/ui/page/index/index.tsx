import { useState } from "react"
import { FiPlus } from "react-icons/fi"

import { Main } from "./Main"

import type { ProjectContext } from "@/ui/context/context"

import { useInjectedContent } from "@/injector/injector"
import { Button } from "@/ui/components/common/Button"
import { useWriteDecomposed } from "@/ui/adapter/subscribe"
import { setUpDirectory } from "@/io/setUpDirectory"
import { Provider } from "@/ui/adapter/provider"

export const IndexPage = () => {
  const {
    io: { openDir },
  } = useInjectedContent()
  const [projectContext, setProjectContext] = useState<ProjectContext | null>()

  const handleSetUp = async () => {
    const entry = await openDir()
    const config = await setUpDirectory(entry)
    console.log({ entry, config })
    setProjectContext({ entry, config })
  }

  useWriteDecomposed(projectContext ?? null)

  if (projectContext == null) {
    return (
      <div className="grid h-full min-h-screen w-full place-items-center bg-slate-50">
        <div className="flex w-[480px] flex-col rounded-lg border-slate-200 bg-white p-10 shadow">
          <Button onClick={handleSetUp} prefix={FiPlus}>
            開く
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Provider context={projectContext}>
      <Main />
    </Provider>
  )
}
