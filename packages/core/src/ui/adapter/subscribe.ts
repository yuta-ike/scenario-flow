import { useEffect } from "react"

import { store } from "./store"

import type { ProjectContext } from "../context/context"
import type { Json } from "@/utils/json"
import type { ProjectEntry } from "@/main"

import { decomposedForLibAtom } from "@/domain/selector/decomposedForPlugin"
import { useInjectedContent } from "@/main"
import { jsonToYaml } from "@/utils/yaml"

const getEntryRec = (entry: ProjectEntry, path: string[]): ProjectEntry => {
  if (path.length === 0) {
    return entry
  }
  const [head, ...tail] = path
  const dir = entry.children.find((child) => child.name === head)
  if (dir == null) {
    throw new Error("not found")
  }
  return getEntryRec(dir, tail)
}

export const useWriteDecomposed = (context: ProjectContext | null) => {
  const entry = context?.entry

  const {
    io: { writeFile, createFile },
  } = useInjectedContent()

  useEffect(() => {
    if (entry == null) {
      return
    }
    // TODO: リファクタリング
    const unsubscribeDecomposed = store.subscribe(decomposedForLibAtom, () => {
      const decomposedForLib = store.get(decomposedForLibAtom)
      decomposedForLib.forEach(async ({ meta, contents }) => {
        console.log(entry.files, meta.page)
        const path = meta.page.split("/").filter((p) => p !== "")
        const dir = getEntryRec(entry, path)
        const file =
          dir.files.find(
            (file) =>
              file.name === `${meta.title}.yaml` ||
              file.name === `${meta.title}.yml`,
          ) ?? (await createFile(entry, `${meta.title}.yaml`))

        console.log(file, contents)
        await writeFile(file, jsonToYaml(contents as Json))
      })
    })

    // const unsubscribeResource = store.subscribe(resourcesAtom, async () => {
    //   const resources = store.get(resourcesAtom)
    //   // await updateResourceConfig(projectEntry, resources)
    // })

    return () => {
      unsubscribeDecomposed()
      // unsubscribeResource()
    }
  }, [createFile, entry, writeFile])
}
