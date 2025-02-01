type Listener = () => void

export class ContainerCls<ContainerContent> {
  #listeners: Listener[] = []

  #injectedContent: ContainerContent | null = null

  public setContent(newContent: ContainerContent) {
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
