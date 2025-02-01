import { useAtomValue } from "jotai"
import {
  Initializer,
  ResourceImport,
  useReloader,
} from "../../adapter/initializer"
import { useWriteOutSubscription } from "../../adapter/subscribe"
import { Main } from "./Main"
import { nodesAtom } from "../../../domain/datasource/node"
import { primitiveRoutesAtom } from "../../../domain/datasource/route"
import { memo, useEffect } from "react"
import { useStore } from "../../lib/provider"

export const IndexPage = () => {
  return (
    <ResourceImport>
      <Initializer>
        <Inner2 />
      </Initializer>
    </ResourceImport>
  )
}

const Inner2 = memo(() => {
  const store = useStore()
  useWriteOutSubscription()

  const nodes = useAtomValue(nodesAtom, { store: store.store })
  const routes = useAtomValue(primitiveRoutesAtom, { store: store.store })
  // const reload = useReloader()

  // useEffect(() => {
  //   const listener = () => {
  //     // reload()
  //   }
  //   window.addEventListener("focus", listener)
  //   return () => window.removeEventListener("focus", listener)
  // }, [])

  return (
    <>
      {/* <div>{store.gen}</div>
      <div className="flex">
        <pre className="max-h-[400px] flex-1 overflow-y-auto whitespace-pre">
          {nodes.length}
          <br />
          {nodes.map(({ id, name }) => `${id}---${name}`).join("\n")}
        </pre>
        <pre className="max-h-[400px] flex-1 overflow-y-auto whitespace-pre">
          {routes.length}
          <br />
          {routes.map(({ id, name }) => `${id}---${name}`).join("\n")}
        </pre>
      </div> */}
      <Main />
    </>
  )
})
