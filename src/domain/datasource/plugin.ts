import { atom } from "jotai"

import type { ExportPluginId } from "../entity/plugin/plugin"

export const exportPluginIdAtom = atom<ExportPluginId>("runn")
