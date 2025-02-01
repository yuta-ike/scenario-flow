import type { InjectedStore } from "./parts/store"
import type { InjectedContentExec } from "./parts/exec"
import type { InjectedIo } from "./parts/io"

export type InjectedContent<
  FileEntryAdditional extends Record<string, unknown> = Record<string, unknown>,
  DirEntryAdditional extends Record<string, unknown> = FileEntryAdditional,
> = {
  io: InjectedIo<FileEntryAdditional, DirEntryAdditional>
  exec: InjectedContentExec
  fetch: {
    fetch?: typeof window.fetch
  }
  store: InjectedStore
}
