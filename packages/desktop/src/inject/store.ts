import { LazyStore } from "@tauri-apps/plugin-store"

import type { InjectedStore, AppStore } from "@/injector/parts/store"

const store = new LazyStore("projects.json")

type Callback = () => void

let subscribes: Callback[] = []

export const loadStore: InjectedStore["loadStore"] = async () => {
  const version = (await store.get<string | undefined>("version")) ?? "1.0.0"
  if (version !== "1.0.0") {
    throw new Error("Unknown version")
  }

  const projects =
    (await store.get<AppStore["projects"] | undefined>("projects")) ?? []

  return {
    version,
    projects,
  }
}

export const saveStore: InjectedStore["saveStore"] = async (value) => {
  await store.set("version", value.version)
  await store.set("projects", value.projects)

  subscribes.forEach((callback) => callback())
}

export const subscribeStore: InjectedStore["subscribeStore"] = (_callback) => {
  subscribes.push(_callback)
  return () => {
    subscribes = subscribes.filter((callback) => callback !== _callback)
  }
}
