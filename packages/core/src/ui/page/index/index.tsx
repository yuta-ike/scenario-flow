import { useState } from "react"
import { FiPlus } from "react-icons/fi"
import { Provider as JotaiProvider } from "jotai"
import { DevTools as JotaiDevTools } from "jotai-devtools"

import { Main } from "./Main"

import type { ProjectContext } from "@/ui/context/context"

import { Button } from "@/ui/components/common/Button"
import { useWriteOutSubscription } from "@/ui/adapter/subscribe"
import { setUpDirectory } from "@/io/setUpDirectory"
import { ProjectContextProvider } from "@/ui/adapter/ProjectContext"
import { useInjected } from "@/ui/adapter/container"
import { Initializer, ResourceImport } from "@/ui/adapter/initializer"
import { store } from "@/ui/adapter/store"

export const IndexPage = () => {
  const [projectContext, setProjectContext] = useState<ProjectContext | null>()
  const injected = useInjected()

  const handleSetUp = async () => {
    const entry = await injected.io.openDir()
    const config = await setUpDirectory(entry, injected)
    setProjectContext({ entry, config })
  }

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
    <JotaiProvider store={store.store}>
      <ProjectContextProvider context={projectContext}>
        <Inner />
      </ProjectContextProvider>
      <JotaiDevTools />
    </JotaiProvider>
  )
}

const Inner = () => {
  return (
    <ResourceImport>
      <Initializer>
        <Inner2 />
      </Initializer>
    </ResourceImport>
  )
}

const Inner2 = () => {
  return <Inner3 />
}

const Inner3 = () => {
  useWriteOutSubscription()

  return <Main />
}
