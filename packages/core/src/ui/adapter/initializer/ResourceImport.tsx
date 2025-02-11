import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { TbCheck } from "react-icons/tb"

import { uploadOpenApiFile } from "../command"

import { parseYaml } from "@scenario-flow/util/lib"
import { addSetOp, joinPath, useAsync } from "@scenario-flow/util"
import { Button } from "@scenario-flow/ui"
import { useProjectContext, useInjected, useStore } from "../../lib/provider"
import { FileHandle } from "../../../injector"

type Props = {
  children: React.ReactNode
}

export const ResourceImport = ({ children }: Props) => {
  const store = useStore()
  const context = useProjectContext()
  const injected = useInjected()

  const [initialized, setInitialized] = useState(false)

  const resourcePaths = useMemo(
    () =>
      Object.entries(context.config.resources.openapi?.local_file ?? {}).map(
        ([name, path]) => {
          return { name, path }
        },
      ),
    [context.config.resources.openapi?.local_file],
  )

  const { data, isLoading } = useAsync(async () => {
    const resources = await Promise.allSettled(
      resourcePaths.map(async ({ path, name }) => {
        const handle = await injected.io.selectFile(path, {
          cacheKey: context.project.id,
          silent: true,
        })

        if (handle == null) {
          throw new Error("not found")
        }
        return {
          name,
          handle,
        }
      }),
    )

    return {
      completed: resources
        .filter(
          (
            resource,
          ): resource is PromiseFulfilledResult<{
            name: string
            handle: FileHandle
          }> => resource.status === "fulfilled",
        )
        .map(({ value }) => value),
      failed: resources.filter(
        (resource): resource is PromiseRejectedResult =>
          resource.status === "rejected",
      ),
    }
  })

  const [resolvedResourceNames, setResolvedResourceNames] = useState(
    new Set<string>(),
  )

  const [completed, setCompleted] = useState(false)

  const importResources = useCallback(
    async (name: string, fileHandle: FileHandle) => {
      const content = await injected.io.readFile(fileHandle)

      const json = parseYaml(content)
      if (json.result === "error") {
        window.alert("ファイルの読み込みに失敗しました")
        return false
      }
      const result = await uploadOpenApiFile(
        store,
        name,
        "",
        fileHandle.path,
        json.value,
        async (path) => {
          const handle = await injected.io.selectFile(
            joinPath(fileHandle.path, path),
          )
          return injected.io.readFile(handle)
        },
      )
      if (result.result === "error") {
        console.error(result.error)
        window.alert("OpenAPIファイルの形式が正しくありません")
        return false
      }
      return true
    },
    [injected.io],
  )

  const handleAddResource = async (name: string) => {
    const fileHandle = await injected.io.selectFile(undefined, {
      cacheKey: context.project.id,
    })
    const success = await importResources(name, fileHandle)
    if (success) {
      setResolvedResourceNames(addSetOp(name))
    }
  }

  const executedRef = useRef(false)
  useEffect(() => {
    if (!executedRef.current && data != null && data.failed.length === 0) {
      executedRef.current = true
      void (async () => {
        await Promise.allSettled(
          data.completed.map(({ name, handle }) =>
            importResources(name, handle),
          ),
        )
        setCompleted(true)
        executedRef.current = false
      })()
    } else if (data != null) {
      setInitialized(true)
    }
  }, [data, importResources])

  if (completed) {
    return children
  }
  if (isLoading || !initialized) {
    return <div className="h-screen w-screen bg-slate-50" />
  }
  return (
    <div className="grid h-screen w-screen place-items-center bg-slate-100">
      <section className="flex w-[400px] flex-col overflow-hidden rounded-lg bg-white shadow">
        <div className="p-4">
          <h2 className="text-lg">アクセスできないリソースがあります</h2>
        </div>
        <div className="p-4 pt-0">
          {resourcePaths.map(({ name }) => (
            <div
              key={name}
              className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 p-2"
            >
              <div className="text-sm text-slate-600">
                {name}（ローカルファイル）
              </div>
              {resolvedResourceNames.has(name) ? (
                <div className="flex items-center gap-1 px-2 py-1 text-sm font-bold text-green-600">
                  <TbCheck strokeWidth={3} />
                  OK
                </div>
              ) : (
                <div className="shrink-0">
                  <Button
                    size="sm"
                    theme="primary"
                    onClick={() => handleAddResource(name)}
                  >
                    ファイルを選択
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex shrink-0 justify-end gap-4 border-t border-t-slate-200 bg-slate-50 px-4 py-3">
          <Button type="submit" onClick={() => setCompleted(true)}>
            確定
          </Button>
        </div>
      </section>
    </div>
  )
}
