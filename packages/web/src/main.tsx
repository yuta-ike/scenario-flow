import "./inject"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import Core from "@scenario-flow/app"

import { injectedContent } from "./inject"

const root = document.getElementById("root")

if (root == null) {
  throw new Error("No root element found")
}

createRoot(root).render(
  <StrictMode>
    <Core injected={injectedContent} />
  </StrictMode>,
)
