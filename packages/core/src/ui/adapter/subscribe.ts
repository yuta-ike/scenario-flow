import { useEffect } from "react"

import { store } from "./store"

import type { ProjectEntry } from "@/main"
import type { Json } from "@/utils/json"

import { decomposedForLibAtom } from "@/domain/selector/decomposedForPlugin"
import { useInjectedContent } from "@/main"
import { jsonToYaml } from "@/utils/yaml"
import { resourcesAtom } from "@/domain/datasource/resource"
// import { updateResourceConfig } from "@/io/setUpDirectory"

export const useWriteDecomposed = (projectEntry: ProjectEntry | null) => {
  const {
    io: { writeFile, createFile },
  } = useInjectedContent()

  useEffect(() => {
    if (projectEntry == null) {
      return
    }
    // TODO: リファクタリング
    const unsubscribeDecomposed = store.subscribe(decomposedForLibAtom, () => {
      const decomposedForLib = store.get(decomposedForLibAtom)
      decomposedForLib.forEach(async ({ meta, contents }) => {
        const file =
          projectEntry.files.find(
            (file) =>
              file.name === `${meta.title}.yaml` ||
              file.name === `${meta.title}.yml`,
          ) ?? (await createFile(projectEntry, `${meta.title}.yaml`))

        await writeFile(file, jsonToYaml(contents as Json))
      })
    })

    const unsubscribeResource = store.subscribe(resourcesAtom, async () => {
      const resources = store.get(resourcesAtom)
      // await updateResourceConfig(projectEntry, resources)
    })

    return () => {
      unsubscribeDecomposed()
      unsubscribeResource()
    }
  }, [createFile, projectEntry, writeFile])
}
