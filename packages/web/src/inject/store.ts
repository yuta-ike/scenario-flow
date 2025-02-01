import type { AppStore, InjectedStore } from "@scenario-flow/app"

const KEY = "scenario-flow:projects.json"

type Callback = () => void

let listeners: Callback[] = []

export const loadStore: InjectedStore["loadStore"] = () => {
  const data = localStorage.getItem(KEY)
  if (data == null) {
    return { version: "1.0.0", projects: [] }
  }
  return JSON.parse(data) as AppStore
}

export const saveStore: InjectedStore["saveStore"] = (store) => {
  localStorage.setItem(KEY, JSON.stringify(store))
  listeners.forEach((listener) => {
    listener()
  })
}

export const subscribeStore: InjectedStore["subscribeStore"] = (callback) => {
  listeners.push(callback)
  return () => {
    listeners = listeners.filter((listener) => listener !== callback)
  }
}
