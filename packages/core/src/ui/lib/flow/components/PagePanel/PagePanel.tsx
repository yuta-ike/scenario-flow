import { FiPlus } from "react-icons/fi"

import { AccordionRoot } from "@/ui/components/common/Accordion"
import { IconButton } from "@/ui/components/common/IconButton"
import { usePages } from "@/ui/state/page"

export const PagePanel = () => {
  const { pages, currentPage, select } = usePages()

  return (
    <AccordionRoot>
      <div className="rounded-lg bg-white/60 shadow-object backdrop-blur-sm">
        <div className="flex w-full items-center justify-between border-b border-b-slate-200 px-2 py-1">
          <div className="grow text-xs text-slate-600">ページ</div>
          <div className="shrink-0">
            <IconButton size="sm" icon={FiPlus} label="Add Page" />
          </div>
        </div>
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className="w-full p-1"
            onClick={() => select(page)}
          >
            <form
              onSubmit={(e) => e.preventDefault()}
              data-selected={page === currentPage}
              className="group rounded px-2 py-1 data-[selected=true]:bg-slate-100"
            >
              <input
                name="name"
                defaultValue={page}
                type="text"
                className="pointer-events-none w-full rounded border border-transparent bg-transparent py-1 text-xs transition-[padding] hover:border-slate-200 hover:px-1 focus:px-1 focus:outline-none focus-visible:border-slate-400 group-data-[selected=true]:font-bold"
                placeholder="ルート"
                onBlur={(e) => {}}
              />
            </form>
          </button>
        ))}
      </div>
    </AccordionRoot>
  )
}
