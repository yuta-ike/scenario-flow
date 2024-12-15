import { convertDecomposedListToRunn } from "./convert"
import { revertRunnToDecomposed } from "./revert"
import { runnRunner } from "./runner"

import type { EnginePlugin } from "../type"

export const plugin: EnginePlugin = {
  serialize: convertDecomposedListToRunn,
  deserialize: revertRunnToDecomposed,
  runner: runnRunner,
}
