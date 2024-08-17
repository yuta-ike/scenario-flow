import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { IndexPage } from "./pages/index.tsx"
import { DevTools } from "./DevTools.tsx"

import "./globals.css"

const root = document.getElementById("root")

if (root == null) {
  throw new Error("No root element found")
}

createRoot(root).render(
  <StrictMode>
    <IndexPage />
    <DevTools />
  </StrictMode>,
)
