import { memo, useCallback, useMemo, useState } from "react"
import * as RxSelect from "@radix-ui/react-select"
import { TbCheck, TbChevronDown, TbChevronUp } from "react-icons/tb"
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react"
import { FiChevronDown, FiPlus } from "react-icons/fi"

import { MethodChip } from "./MethodChip"

import {
  associateWithList,
  HTTP_METHODS,
  HttpMethod,
  searchFuzzy,
} from "@scenario-flow/util"
import { ActionSourceIdentifier } from "../../../domain/entity/action/identifier"
import {
  displayIdentifier,
  OpenApiResourceLocalIdentifier,
} from "../../../domain/entity/resource/identifier"
import { ResourceId } from "../../../domain/entity/resource/resource"
import { useActions, useResource } from "../../adapter/query"

type MethodPath = {
  identifier: ActionSourceIdentifier
  method: HttpMethod
  path: string
}

type Props = {
  method: HttpMethod
  path: string
  onChange: (
    data:
      | { identifier: ActionSourceIdentifier; method: HttpMethod; path: string }
      | { method: HttpMethod; path: string },
  ) => void
}

export const PathMethodInput = ({ method, path, onChange }: Props) => {
  const actions = useActions()
  const restCallActions = useMemo(
    () =>
      actions
        .filter((action) => action.type === "rest_call")
        .map((action) => ({
          identifier: action,
          method: action.schema.base.method!,
          path: action.schema.base.path!,
        })),
    [actions],
  )

  const actionsMap = useMemo(
    () =>
      associateWithList(
        restCallActions,
        (action) => `${action.method}_${action.path}`,
      ),
    [restCallActions],
  )

  const handleChange = useCallback(
    ({
      path: _path = path,
      method: _method = method,
    }: { method?: HttpMethod; path?: string } = {}) => {
      const identifier = actionsMap.get(`${_method}_${_path}`)?.[0]
      if (identifier != null) {
        onChange(identifier)
      } else {
        onChange({ method: _method, path: _path })
      }
    },
    [actionsMap, method, onChange, path],
  )

  const [query, setQuery] = useState(path)

  const filteredActions = useMemo(() => {
    const exampleOmitted = restCallActions.filter(
      (action) => !(action.method === "GET" && action.path === "/example"),
    )

    if (query.length === 0) {
      return exampleOmitted
    }

    return searchFuzzy(query, exampleOmitted, {
      keys: ["method", "path"],
    })
  }, [restCallActions, query])

  const shouldShowCreateOption = useMemo(
    () =>
      1 <= query.length &&
      !filteredActions.some(
        (action) => action.path === query && action.method === method,
      ),
    [filteredActions, method, query],
  )

  return (
    <div className="relative flex grow items-stretch overflow-hidden rounded-md border border-slate-200">
      <HttpMethodSelector
        method={method}
        onChange={(method) => handleChange({ method })}
      />
      <hr className="h-auto self-stretch border-r border-r-slate-200" />
      <Combobox
        immediate
        value={useMemo(() => ({ method, path }), [method, path])}
        onChange={(value) => {
          if (value != null) {
            handleChange(value)
          }
        }}
        onClose={() => setQuery("")}
      >
        <ComboboxInput
          className="text flex grow flex-col items-stretch justify-stretch px-3 font-mono text-sm hover:bg-slate-50 focus:bg-slate-50 focus:outline-none data-[dirty=true]:bg-blue-50"
          displayValue={(action: MethodPath) => action.path}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={(e) => handleChange({ path: e.target.value })}
        />
        <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
          <FiChevronDown className="size-4 fill-white/60 text-slate-400 group-data-[hover]:fill-white" />
        </ComboboxButton>
        <ComboboxOptions
          anchor="bottom start"
          transition
          className="min-w-[var(--input-width)] rounded-md border border-slate-200 bg-white p-1 transition duration-100 ease-in [--anchor-gap:var(--spacing-1)] data-[leave]:data-[closed]:opacity-0"
        >
          {shouldShowCreateOption && (
            <ComboboxOption
              value={{ method, path: query }}
              className="group flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm text-slate-600 data-[focus]:bg-blue-50"
            >
              <MethodChip size="sm" truncate={3}>
                {method}
              </MethodChip>
              <div className="font-mono text-sm">{query}</div>
              <div className="ml-auto flex shrink-0 items-center rounded text-xs text-slate-400 group-data-[focus]:text-stone-800">
                <FiPlus className="shrink-0" />
              </div>
            </ComboboxOption>
          )}
          {filteredActions.map((action) => (
            <ComboboxOption
              key={JSON.stringify(action.identifier)}
              value={action}
              className="group flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm text-slate-600 data-[focus]:bg-blue-50"
            >
              <MethodChip size="sm" truncate={3}>
                {action.method}
              </MethodChip>
              <div className="font-mono text-sm">{action.path}</div>
              <span className="ml-auto shrink-0 text-xs text-slate-400 group-data-[focus]:text-stone-800">
                {action.identifier.resourceType === "user_defined" ? (
                  "ユーザー定義"
                ) : (
                  <ResourceName
                    resourceId={action.identifier.resourceIdentifier.resourceId}
                  />
                )}
              </span>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  )
}

const ResourceName = memo(({ resourceId }: { resourceId: ResourceId }) => {
  const resource = useResource(resourceId)
  return resource.name
})

const HttpMethodSelector = ({
  method,
  onChange,
}: {
  method: HttpMethod
  onChange: (method: HttpMethod) => void
}) => {
  return (
    <RxSelect.Root
      value={method}
      onValueChange={(value) => onChange(value as HttpMethod)}
    >
      <RxSelect.Trigger className="flex items-center gap-2 px-3 py-2 transition hover:bg-slate-50 focus:outline-none data-[state=open]:bg-slate-50">
        <div className="flex min-h-[1lh] grow truncate text-sm">
          <RxSelect.Value />
        </div>
        <RxSelect.Icon className="shrink-0 text-slate-400">
          <TbChevronDown />
        </RxSelect.Icon>
      </RxSelect.Trigger>
      <RxSelect.Portal>
        <RxSelect.Content
          position="popper"
          className="z-50 w-full min-w-[var(--radix-select-trigger-width)] rounded border-slate-200 bg-white shadow-object"
        >
          <RxSelect.ScrollUpButton className="flex h-[25px] cursor-default items-center justify-center bg-white">
            <TbChevronUp />
          </RxSelect.ScrollUpButton>
          <RxSelect.Viewport className="w-full p-[5px]">
            {HTTP_METHODS.map((method) => (
              <RxSelect.Item
                key={method}
                value={method}
                className="relative flex cursor-pointer select-none items-center rounded py-2 pl-[25px] pr-[35px] text-sm leading-none data-[highlighted]:bg-slate-50 data-[highlighted]:outline-none"
              >
                <RxSelect.ItemText>
                  <MethodChip size="lg">{method}</MethodChip>
                </RxSelect.ItemText>
                <RxSelect.ItemIndicator className="absolute left-0 inline-flex w-[25px] items-center justify-center">
                  <TbCheck />
                </RxSelect.ItemIndicator>
              </RxSelect.Item>
            ))}
          </RxSelect.Viewport>
          <RxSelect.ScrollDownButton className="flex h-[25px] cursor-default items-center justify-center bg-white">
            <TbChevronDown />
          </RxSelect.ScrollDownButton>
        </RxSelect.Content>
      </RxSelect.Portal>
    </RxSelect.Root>
  )
}
