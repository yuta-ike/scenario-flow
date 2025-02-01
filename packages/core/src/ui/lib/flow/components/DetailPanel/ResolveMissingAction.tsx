import { useMemo, useState } from "react"
import { TbFileCode2, TbReplace } from "react-icons/tb"
import { RadioPanel, FormItem, FormModalContent } from "@scenario-flow/ui"
import { searchFuzzy } from "@scenario-flow/util"
import { useStore } from "../../../provider"
import { ActionId, getIdentifier } from "../../../../../domain/entity"
import { replaceAction } from "../../../../adapter/command"
import { useActions } from "../../../../adapter/query"
import { ApiCallTile } from "../../../../page/index/BlockMenu/ApiCallTile"

type Props = {
  actionId: ActionId
}

export const ResolveMissingAction = ({ actionId }: Props) => {
  const store = useStore()

  const [strategy, setStrategy] = useState<"replace" | "userDefined">("replace")
  const [selectedActionId, setSelectedActionId] = useState<ActionId | null>(
    null,
  )

  const actions = useActions().filter((action) => action.type === "rest_call")

  const [searchText, setSeachText] = useState("")

  const filteredActions = useMemo(() => {
    if (searchText.length === 0) {
      return actions
    }

    return searchFuzzy(searchText, actions, {
      keys: [
        (action) => action.schema.base.method ?? "",
        (action) => action.schema.base.path ?? "",
        "name",
        "description",
      ],
    })
  }, [actions, searchText])

  const handleSubmit = () => {
    if (strategy === "replace") {
      if (selectedActionId == null) {
        return
      }
      replaceAction(store, actionId, selectedActionId)
    }
  }

  return (
    <FormModalContent onSubmit={handleSubmit} okLabel="更新する">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <RadioPanel
            icon={TbReplace}
            name="method"
            value="file"
            onChange={(e) => e.target.checked && setStrategy("replace")}
            defaultChecked={strategy === "replace"}
            description="APIに破壊的変更があった場合に有効です"
          >
            他のアクションで置き換える
          </RadioPanel>
          <RadioPanel
            icon={TbFileCode2}
            name="method"
            value="remote"
            onChange={(e) => e.target.checked && setStrategy("userDefined")}
            defaultChecked={strategy === "userDefined"}
          >
            APIスキーマを無視する
          </RadioPanel>
        </div>
        {strategy === "replace" ? (
          <FormItem label="置き換えるアクションを選択してください" id="action">
            <div className="flex flex-col gap-2">
              <input
                placeholder="検索"
                type="text"
                value={searchText}
                onChange={(e) => setSeachText(e.target.value)}
                className="w-full rounded border border-transparent bg-slate-100 px-3 py-2 text-sm leading-none transition focus:border-slate-200 focus:outline-none"
              />
              <div className="max-h-[300px] overflow-y-auto">
                <div className="flex flex-col gap-2">
                  {filteredActions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      data-selected={selectedActionId === action.id}
                      onClick={() => setSelectedActionId(action.id)}
                      className="w-full rounded-md border border-transparent data-[selected=true]:border-blue-400 data-[selected=true]:bg-blue-50"
                    >
                      <ApiCallTile
                        key={action.id}
                        actionIdentifier={getIdentifier(action)}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FormItem>
        ) : (
          <div>a</div>
        )}
      </div>
    </FormModalContent>
  )
}
