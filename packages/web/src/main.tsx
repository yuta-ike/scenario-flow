import "./inject"

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import Core from "@scenario-flow/core"

const root = document.getElementById("root")

if (root == null) {
  throw new Error("No root element found")
}

createRoot(root).render(
  <StrictMode>
    <Core />
  </StrictMode>,
)
