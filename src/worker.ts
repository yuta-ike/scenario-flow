import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker"
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker"
import { languages } from "monaco-editor"

// ref: https://github.com/microsoft/monaco-editor/blob/main/samples/browser-esm-vite-react/src/userWorker.ts

self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === "json") {
      return new jsonWorker()
    }
    return new editorWorker()
  },
}

languages.typescript.typescriptDefaults.setEagerModelSync(true)
