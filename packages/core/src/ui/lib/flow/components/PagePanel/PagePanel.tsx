import { FiPlus } from "react-icons/fi"
import { useMemo } from "react"
import { TbChevronRight } from "react-icons/tb"
import * as Accordion from "@radix-ui/react-accordion"
import clsx from "clsx"

import { CreateNewPageForm } from "./CreateNewPageForm"
import { PageTitle } from "./PageTitle"

import { AccordionRoot } from "@/ui/components/common/Accordion"
import { IconButton } from "@/ui/components/common/IconButton"
import { usePage } from "@/ui/state/page"
import { FormModal } from "@/ui/lib/common/FormModal"
import { normalizePath } from "@/io/scenario/resolvePath"
import { fill } from "@/utils/placeholder"

type PageFolder = {
  title: string
  frag: string
  children: PageFolder[]
  pages: string[]
}

export const PagePanel = () => {
  const { pages } = usePage()

  const rootDir = useMemo(() => {
    const root: PageFolder = { title: "", frag: "", children: [], pages: [] }
    pages.forEach((page) => {
      normalizePath(page).reduce((current, frag) => {
        let childPage = current.children.find((child) => child.frag === frag)
        if (childPage == null) {
          childPage = {
            title: `${current.title}/${frag}`,
            frag,
            children: [],
            pages: [],
          }
          current.children.push(childPage)
        }
        return childPage
      }, root)
    })
    return root
  }, [pages])

  return (
    <AccordionRoot>
      <div>
        <div className="flex w-full items-center justify-between px-2 py-1">
          <div className="grow text-xs text-slate-600">ページ</div>
          <div className="shrink-0">
            <FormModal
              title="ページの追加"
              description="新しいページを追加する"
              modal={<CreateNewPageForm />}
            >
              <IconButton size="sm" icon={FiPlus} label="Add Page" />
            </FormModal>
          </div>
        </div>
        <div>
          <Accordion.Root
            type="multiple"
            defaultValue={[fill(rootDir.frag, "ルート")]}
          >
            <PageFolder folder={rootDir} />
          </Accordion.Root>
        </div>
      </div>
    </AccordionRoot>
  )
}

const PageFolder = ({
  folder,
  depth = 0,
}: {
  folder: PageFolder
  depth?: number
}) => {
  return (
    <Accordion.Item
      value={fill(folder.frag, "ルート")}
      className="flex flex-col gap-px"
      style={{
        paddingLeft: depth * 8,
      }}
    >
      <Accordion.Header className="flex w-full items-center">
        <Accordion.Trigger
          className={clsx(
            "group shrink-0",
            (depth === 0 || folder.children.length === 0) && "invisible",
          )}
        >
          <div className="grid h-5 w-5 place-items-center rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-800">
            <TbChevronRight
              size={12}
              className="transition group-hover:stroke-[3px] group-data-[state=open]:rotate-90"
            />
          </div>
        </Accordion.Trigger>
        <div className="grow">
          <PageTitle
            page={folder.title}
            frag={fill(folder.frag, "ルート")}
            paddingLeft={0}
          />
        </div>
      </Accordion.Header>
      <Accordion.Content>
        <Accordion.Root
          type="multiple"
          defaultValue={folder.children.map((child) =>
            fill(child.frag, "ルート"),
          )}
        >
          {folder.children.map((child) => (
            <div key={child.frag}>
              <PageFolder folder={child} depth={depth + 1} />
            </div>
          ))}
        </Accordion.Root>
      </Accordion.Content>
    </Accordion.Item>
  )
}
