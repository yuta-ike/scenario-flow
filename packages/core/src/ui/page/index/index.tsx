import { useEffect, useMemo, useRef, useState } from "react"
import { FiClock, FiDownload, FiPenTool, FiPlus } from "react-icons/fi"
import { Provider as JotaiProvider } from "jotai"
import { DevTools as JotaiDevTools } from "jotai-devtools"

import { Main } from "./Main"
import { Layout } from "./Layout"
import { CreateProjectModal } from "./CreateProjectModal/CreateProjectModal"

import type { DirHandle } from "@/injector/parts/io"

import { type ProjectContext } from "@/ui/context/context"
import { Button } from "@/ui/components/common/Button"
import { useWriteOutSubscription } from "@/ui/adapter/subscribe"
import { setUpDirectory } from "@/io/setUpDirectory"
import { ProjectContextProvider } from "@/ui/adapter/ProjectContext"
import { useInjected } from "@/ui/adapter/container"
import { Initializer, ResourceImport } from "@/ui/adapter/initializer"
import { store } from "@/ui/adapter/store"
import { useAsync } from "@/ui/utils/useAsync"
import { formatDistance } from "@/utils/datetime"
import { FormModal } from "@/ui/lib/common/FormModal"
import { dedupeArrayByKey } from "@/utils/array"
import { Project, updateLastModified } from "@/ui/domain/project"
import { genId } from "@/utils/uuid"

export const IndexPage = () => {
  const [projectContext, setProjectContext] = useState<ProjectContext | null>()
  const injected = useInjected()

  const { data, isLoading, refetch } = useAsync(() =>
    injected.store.loadStore(),
  )
  useEffect(
    () => injected.store.subscribeStore(refetch),
    [injected.store, refetch],
  )

  const projects = useMemo(
    () =>
      data?.projects?.toSorted(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ) ?? [],
    [data?.projects],
  )

  const [tabs, setTabs] = useState<{ id: string; label: string }[]>([])
  const [selectedHandle, setSelectedHandle] = useState<DirHandle | null>(null)

  const cacheKeyRef = useRef<string>(genId())

  const handleCreate = async () => {
    if (isLoading) {
      return
    }
    const cacheKey = genId()
    cacheKeyRef.current = cacheKey
    const dirHandle = await injected.io.selectDir(undefined, { cacheKey })
    setSelectedHandle(dirHandle)
  }

  const handleCreateCompleted = async (name: string, dirHandle: DirHandle) => {
    const project = Project({
      id: cacheKeyRef.current,
      name,
      path: dirHandle.path,
    })
    await injected.store.saveStore({
      version: "1.0.0",
      projects: [...projects, project],
    })
    store.clear()
    const config = await setUpDirectory(dirHandle, injected, project)
    setProjectContext({ project, entry: dirHandle, config })
    setSelectedHandle(null)
    setTabs((tabs) =>
      dedupeArrayByKey([...tabs, { id: dirHandle.path, label: name }], "id"),
    )
  }

  const handleOpen = async (path: string) => {
    if (isLoading) {
      return
    }

    const targetProject = projects.find((project) => project.path === path)
    if (targetProject == null) {
      return
    }

    const dirHandle = await injected.io.selectDir(path, {
      cacheKey: targetProject.id,
    })

    const updated = updateLastModified(targetProject)

    await injected.store.saveStore({
      version: "1.0.0",
      projects: projects.map((project) =>
        project.path === updated.path ? updated : project,
      ),
    })
    store.clear()
    const config = await setUpDirectory(dirHandle, injected, targetProject)
    setProjectContext({ project: updated, entry: dirHandle, config })

    const name = projects.find((project) => project.path === path)!.name
    setTabs((tabs) =>
      dedupeArrayByKey([...tabs, { id: path, label: name }], "id"),
    )
  }

  const handleResetHistory = async () => {
    await injected.store.saveStore({
      version: "1.0.0",
      projects: [],
    })
    setTabs([])
  }

  const handleReset = () => {
    setProjectContext(null)
    store.clear()
  }

  if (projectContext == null) {
    return (
      <>
        <Layout tabs={tabs} onSelect={(path) => handleOpen(path)}>
          <div className="mx-auto flex h-full w-full flex-col gap-4 rounded-lg border border-slate-100 bg-white p-6 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-slate-600">
                プロジェクト一覧
              </h1>
            </div>
            <div className="flex w-full justify-end gap-2">
              <Button
                onClick={() => handleCreate()}
                prefix={FiDownload}
                loading={isLoading}
              >
                インポート
              </Button>
              <Button
                onClick={() => handleCreate()}
                prefix={FiPlus}
                loading={isLoading}
              >
                新しいプロジェクト
              </Button>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 empty:hidden">
              {projects.map(({ name, path, lastModified }, index) => (
                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                <div
                  key={`${path}_${index}`}
                  className="group relative flex cursor-pointer items-center justify-between gap-4 overflow-hidden border-t border-t-slate-200 px-4 py-3 transition first:border-none hover:bg-slate-50"
                  onClick={() => handleOpen(path)}
                >
                  <div className="flex grow flex-col gap-1">
                    <div className="text-xl text-slate-600 group-hover:underline">
                      {name}
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                      <div>{path}</div>・
                      <div className="flex items-center">
                        <FiClock className="mr-1 inline text-[13px]" />
                        {formatDistance(lastModified)}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Button onClick={() => handleOpen(path)}>開く</Button>
                  </div>
                </div>
              ))}
            </div>
            {projects.length === 0 && (
              <div className="w-xl flex max-w-full flex-col items-center gap-4 rounded-lg border border-blue-200 bg-blue-50 p-8 text-slate-600">
                <FiPenTool size={36} />
                <h2>新しいプロジェクトを作成しましょう</h2>
                <Button
                  onClick={() => handleCreate()}
                  prefix={FiPlus}
                  loading={isLoading}
                >
                  新しいプロジェクト
                </Button>
              </div>
            )}
            {0 < projects.length && (
              <div className="mt-4">
                <Button
                  theme="secondary"
                  size="sm"
                  onClick={async () => {
                    const ok = window.confirm(
                      "プロジェクト一覧をクリアしますか？（ファイルは削除されません）",
                    )
                    if (ok) {
                      await handleResetHistory()
                    }
                  }}
                >
                  プロジェクト一覧をクリア
                </Button>
              </div>
            )}
          </div>
        </Layout>
        <FormModal
          isOpen={selectedHandle != null}
          onOpenChange={() => setSelectedHandle(null)}
          title="プロジェクトを新規作成"
          description="プロジェクトを新規作成します"
          modal={
            <CreateProjectModal
              cacheKey={cacheKeyRef.current}
              onSubmit={handleCreateCompleted}
              defaultValues={{
                dirHandle: selectedHandle ?? undefined,
              }}
            />
          }
        />
      </>
    )
  }

  return (
    <JotaiProvider store={store.store}>
      <ProjectContextProvider context={projectContext}>
        <Layout
          tabs={tabs}
          onSelect={(path) => handleOpen(path)}
          current={projectContext.entry.path}
          onClickHome={handleReset}
        >
          <Inner />
        </Layout>
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
  useWriteOutSubscription()

  return <Main />
}
