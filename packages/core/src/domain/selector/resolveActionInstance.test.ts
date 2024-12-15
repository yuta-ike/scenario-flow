import { beforeEach, describe, expect, test } from "vitest"
import { atom } from "jotai"

import { resourceAtom, resourceIdsAtom } from "../datasource/resource"
import { userDefinedActionAtom } from "../datasource/userDefinedAction"
import { toActionInstanceId } from "../entity/node/actionInstance.util"
import { toResourceId } from "../entity/resource/resource.util"
import { toUserDefinedActionId } from "../entity/userDefinedAction/userDefinedAction.util"
import { buildResource } from "../entity/resource/resource"
import { buildRestCallActionInstance } from "../entity/node/actionInstance"

import { resolveActionInstance } from "./resolveActionInstance"

import type { ResolvedActionInstance } from "../entity/node/actionInstance"
import type { StripeSymbol } from "../entity/type"
import type { OperationId } from "../entity/resource/identifier"
import type { Resource } from "../entity/resource/resource"
import type { Expression } from "../entity/value/expression"
import type { OmitId } from "@/utils/idType"

import { addSetOp } from "@/utils/set"
import { createStore } from "@/lib/jotai/store"

const store = createStore()

describe("actionInstance > resolvedActionInstanceAtom", () => {
  beforeEach(() => {
    store.clear()
    resourceAtom.clearAll()
    userDefinedActionAtom.clearAll()
  })

  test("resource で定義されたOpenAPIを参照できる", () => {
    resourceAtom(
      toResourceId("r1"),
      buildResource("r1", {
        type: "openapi",
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
        location: {
          locationType: "local_file",
          path: "/path/to/resource",
        },
      } as StripeSymbol<OmitId<Resource>>),
    )

    store.set(resourceIdsAtom, addSetOp(toResourceId("r1")))

    const actionInstance = buildRestCallActionInstance("ai1", {
      type: "rest_call" as const,
      description: "",
      instanceParameter: {
        headers: [],
        cookies: [],
        queryParams: [],
        pathParams: [],
      },
      actionIdentifier: {
        resourceType: "resource",
        resourceIdentifier: {
          resourceId: toResourceId("r1"),
          identifier: {
            operationId: "operationId" as OperationId,
          },
        },
      },
      config: {
        followRedirect: false,
        useCookie: false,
      },
    })

    const resolvedAtom = atom((get) =>
      resolveActionInstance(get, actionInstance),
    )
    const resolved = store.get(resolvedAtom)

    expect(resolved).toEqual({
      id: toActionInstanceId("ai1"),
      type: "rest_call",
      description: "",
      instanceParameter: {
        baseUrl: "https://example.com",
        method: "POST",
        path: "/post-test",
        headers: [],
        cookies: [],
        queryParams: [],
        pathParams: [],
        body: {
          params: {
            "application/form-data": [],
            "application/json": undefined,
          },
          selected: undefined,
        },
      },
      config: {
        followRedirect: false,
        useCookie: false,
      },
      action: {
        id: expect.any(String) as string,
        name: "operationId",
        description: "",
        resourceIdentifier: {
          identifier: {
            operationId: "operationId",
          },
          resourceId: "r1",
        },
        schema: {
          base: {
            method: "POST",
            path: "/post-test",
            baseUrl: "https://example.com",
          },
          examples: [
            {
              baseUrl: "https://example.com",
              body: {
                params: {
                  "application/form-data": [],
                  "application/json": {},
                },
                selected: "application/json",
              },
              cookies: [],
              headers: [],
              method: "POST",
              path: "/post-test",
              pathParams: [],
              queryParams: [],
            },
          ],
          jsonSchema: {
            operationId: "operationId",
          },
        },
        type: "rest_call",
        resourceType: "resource",
      },
      actionIdentifier: {
        resourceType: "resource",
        resourceIdentifier: {
          resourceId: toResourceId("r1"),
          identifier: {
            operationId: "operationId" as OperationId,
          },
        },
      },
    } satisfies StripeSymbol<ResolvedActionInstance>)
  })

  test("user_defined で定義されたOpenAPIを参照できる", () => {
    store.set(userDefinedActionAtom(toUserDefinedActionId("uda1")), {
      create: {
        id: toUserDefinedActionId("uda1"),
        type: "rest_call" as const,
        name: "post /post-test",
        description: "",
        schema: {
          base: {
            method: "POST",
            path: "/uda" as Expression,
            baseUrl: "https://example.com",
          },
          examples: [],
          jsonSchema: undefined,
        },
      },
    })

    const actionInstance = buildRestCallActionInstance("ai1", {
      type: "rest_call" as const,
      description: "",
      instanceParameter: {
        headers: [],
        cookies: [],
        queryParams: [],
        pathParams: [],
      },
      config: {
        followRedirect: false,
        useCookie: false,
      },
      actionIdentifier: {
        resourceType: "user_defined",
        resourceIdentifier: {
          userDefinedActionId: toUserDefinedActionId("uda1"),
        },
      },
    })

    const resolvedAtom = atom((get) =>
      resolveActionInstance(get, actionInstance),
    )
    const resolved = store.get(resolvedAtom)

    expect(resolved).toEqual({
      id: toActionInstanceId("ai1"),
      type: "rest_call",
      description: "",
      instanceParameter: {
        baseUrl: "https://example.com",
        method: "POST",
        path: "/uda",
        headers: [],
        cookies: [],
        queryParams: [],
        pathParams: [],
        body: {
          params: {
            "application/form-data": [],
            "application/json": undefined,
          },
          selected: undefined,
        },
      },
      config: {
        followRedirect: false,
        useCookie: false,
      },
      action: {
        id: expect.any(String) as string,
        name: "post /post-test",
        description: "",
        schema: {
          base: {
            method: "POST",
            path: "/uda",
            baseUrl: "https://example.com",
          },
          examples: [],
          jsonSchema: undefined,
        },
        resourceType: "user_defined",
        type: "rest_call",
        resourceIdentifier: {
          userDefinedActionId: toUserDefinedActionId("uda1"),
        },
      },
      actionIdentifier: {
        resourceType: "user_defined",
        resourceIdentifier: {
          userDefinedActionId: toUserDefinedActionId("uda1"),
        },
      },
    } satisfies StripeSymbol<ResolvedActionInstance>)
  })
})
