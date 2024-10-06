import { beforeEach, describe, expect, test } from "vitest"
import { atom } from "jotai"

import { resourceAtom, resourceIdsAtom } from "../datasource/resource"
import {
  userDefinedActionAtom,
  userDefinedActionIdsAtom,
} from "../datasource/userDefinedAction"
import { toActionInstanceId } from "../entity/node/actionInstance.util"
import { toActionRefId } from "../entity/node/actionRef.util"
import {
  toResourceActionId,
  toResourceId,
} from "../entity/resource/resource.util"
import { toUserDefinedActionId } from "../entity/userDefinedAction/userDefinedAction.util"
import {
  resourceActionToActionId,
  toActionId,
} from "../entity/action/action.util"

import { resolveActionInstance } from "./resolveActionInstance"

import type { Expression } from "../entity/value/expression"
import type { ActionInstance } from "../entity/node/actionInstance"

import { createStore } from "@/lib/jotai/store"
import { addSetOp } from "@/utils/set"

const store = createStore()

describe("actionInstance > resolvedActionInstanceAtom", () => {
  beforeEach(() => {
    store.clear()
    resourceAtom.clearAll()
    userDefinedActionAtom.clearAll()
  })

  test("resource で定義されたOpenAPIを参照できる", () => {
    resourceAtom(toResourceId("r1"), {
      id: toResourceId("r1"),
      type: "OpenApi",
      name: "Resource 1",
      description: "",
      content: {
        openapi: "3.0.0",
        info: {
          title: "title",
          version: "1.0.0",
        },
        paths: {
          "/post-test": {
            post: {
              operationId: "operationId",
            },
          },
        },
      },
      locationType: "LocalFile",
      path: "/path/to/resource",
    })

    store.set(resourceIdsAtom, addSetOp(toResourceId("r1")))

    const actionInstance: ActionInstance = {
      actionInstanceId: toActionInstanceId("ai1"),
      type: "rest_call" as const,
      instanceParameter: {
        description: "",
        headers: [],
        cookies: [],
        queryParams: [],
        pathParams: [],
        config: {
          followRedirect: false,
          useCookie: false,
        },
      },
      actionRef: {
        id: toActionRefId("ar1"),
        actionId: resourceActionToActionId(
          toResourceActionId("operationId"),
          toResourceId("r1"),
        ),
      },
    }

    const resolvedAtom = atom((get) =>
      resolveActionInstance(get, actionInstance),
    )
    const resolved = store.get(resolvedAtom)

    expect(resolved).toEqual({
      actionInstanceId: toActionInstanceId("ai1"),
      type: "rest_call",
      instanceParameter: {
        description: "",
        headers: [],
        cookies: [],
        queryParams: [],
        pathParams: [],
        config: {
          followRedirect: false,
          useCookie: false,
        },
      },
      action: {
        id: expect.any(String) as string,
        name: "operationId",
        description: "",
        parameter: {
          method: "POST",
          path: "/post-test",
          baseUrl: "https://example.com",
          operationObject: {
            operationId: "operationId",
          },
        },
        type: "rest_call",
        identifier: {
          operationId: "operationId",
        },
        resourceId: "r1",
        source: "resoure",
        resourceActionId: "operationId",
      },
      actionRef: {
        id: toActionRefId("ar1"),
        actionId: toActionId("operationId-r1"),
      },
    })
  })

  test("user_defined で定義されたOpenAPIを参照できる", () => {
    store.set(
      userDefinedActionIdsAtom,
      new Set([toUserDefinedActionId("uda1")]),
    )
    userDefinedActionAtom(toUserDefinedActionId("uda1"), {
      id: toUserDefinedActionId("uda1"),
      type: "rest_call" as const,
      name: "post /post-test",
      description: "",
      parameter: {
        method: "POST",
        path: "/uda" as Expression,
        baseUrl: "https://example.com",
      },
    })

    const actionInstance: ActionInstance = {
      actionInstanceId: toActionInstanceId("ai1"),
      type: "rest_call" as const,
      instanceParameter: {
        description: "",
        headers: [],
        cookies: [],
        queryParams: [],
        pathParams: [],
        config: {
          followRedirect: false,
          useCookie: false,
        },
      },
      actionRef: {
        id: toActionRefId("ar1"),
        actionId: toActionId("uda1"),
      },
    }

    const resolvedAtom = atom((get) =>
      resolveActionInstance(get, actionInstance),
    )
    const resolved = store.get(resolvedAtom)

    expect(resolved).toEqual({
      actionInstanceId: toActionInstanceId("ai1"),
      type: "rest_call",
      instanceParameter: {
        description: "",
        headers: [],
        cookies: [],
        queryParams: [],
        pathParams: [],
        config: {
          followRedirect: false,
          useCookie: false,
        },
      },
      action: {
        id: expect.any(String) as string,
        name: "post /post-test",
        description: "",
        parameter: {
          method: "POST",
          path: "/uda",
          baseUrl: "https://example.com",
        },
        source: "userDefined",
        type: "rest_call",
        userDefinedActionId: "uda1",
      },
      actionRef: {
        id: toActionRefId("ar1"),
        actionId: toActionId("uda1"),
      },
    })
  })
})
