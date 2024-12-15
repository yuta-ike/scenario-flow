import type { InjectedContent } from "./injector"

type Listener = () => void

class ContainerCls<
  FileEntryAdditional extends Record<string, unknown> = Record<string, unknown>,
  DirEntryAdditional extends Record<string, unknown> = FileEntryAdditional,
> {
  #listeners: Listener[] = []

  #injectedContent: InjectedContent<
    FileEntryAdditional,
    DirEntryAdditional
  > | null = null

  public isInitialized() {
    return this.#injectedContent != null
  }

  public setContent(
    newContent: InjectedContent<FileEntryAdditional, DirEntryAdditional>,
  ) {
    console.log("[Log] Set content (Container)")
    this.#injectedContent = newContent
    this.#emit()
  }

  public getContent() {
    return this.#injectedContent
  }

  public subscribe(listener: Listener) {
    console.log("[Log] Subscribe (Container)")
    this.#listeners.push(listener)
    return () => {
      this.#listeners = this.#listeners.filter((l) => l !== listener)
    }
  }

  #emit() {
    console.log("[Log] Emit (Container)")
    this.#listeners.forEach((listener) => listener())
  }
}

export type Container = typeof ContainerCls

export const container = new ContainerCls()
