import * as RadixAccordion from "@radix-ui/react-accordion"
import { HiChevronDown } from "react-icons/hi2"

type AccordionRootProps = {
  children: React.ReactNode
}
export const AccordionRoot = ({ children }: AccordionRootProps) => (
  <RadixAccordion.Root type="multiple" defaultChecked className="w-full">
    {children}
  </RadixAccordion.Root>
)

type AccordionItemProps = {
  value: string
  title: React.ReactNode
  children: React.ReactNode
  gap?: number
}

export const AccordionItem = ({
  value,
  title,
  children,
  gap = 0,
}: AccordionItemProps) => {
  return (
    <RadixAccordion.Item value={value} className="w-full">
      <RadixAccordion.Header className="flex w-full items-center gap-2">
        <div className="grow">{title}</div>
        <RadixAccordion.Trigger className="group shrink-0 rounded p-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600">
          <HiChevronDown
            size={16}
            className="transition group-data-[state=open]:rotate-180"
            strokeWidth={1.3}
          />
        </RadixAccordion.Trigger>
      </RadixAccordion.Header>
      <RadixAccordion.Content
        className="w-full"
        style={{
          marginTop: `${gap}px`,
        }}
      >
        {children}
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  )
}
