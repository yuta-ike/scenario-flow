import { Project } from "../../ui/domain/project"

export type AppStore = {
  version?: "1.0.0"
  projects?: Project[]
}

type Callback = () => void

export type LoadStore = () => Promise<AppStore> | AppStore
export type SaveStore = (store: AppStore) => Promise<void> | void
export type SubscribeStore = (callback: Callback) => Callback

export type InjectedStore = {
  loadStore: LoadStore
  saveStore: SaveStore
  subscribeStore: SubscribeStore
}
