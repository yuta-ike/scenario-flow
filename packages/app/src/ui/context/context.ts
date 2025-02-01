import type { DirHandle } from "../../injector"
import type { ConfigFormat } from "../../schemas/configFormat/type/configFormat"
import type { Project } from "../domain/project"

export type ProjectContext = {
  entry: DirHandle
  config: ConfigFormat
  project: Project
}
