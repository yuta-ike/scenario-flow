import * as RadixAccordion from "@radix-ui/react-accordion"
import { HiChevronDown } from "react-icons/hi2"

type AccordionRootProps = {
  children: React.ReactNode
  onValueChange?: (value: string[]) => void
}
export const AccordionRoot = ({
  children,
  onValueChange,
}: AccordionRootProps) => (
  <RadixAccordion.Root
    type="multiple"
    onValueChange={onValueChange}
    defaultChecked
    className="w-full"
  >
    {children}
  </RadixAccordion.Root>
)

type AccordionItemProps = {
  value: string
  title: React.ReactNode
  children: React.ReactNode
  gap?: number
  /** @default "handle" */
  type?: "handle" | "button" | "custom"
}

export const AccordionItem = ({
  value,
  title,
  children,
  gap = 0,
  type = "handle",
}: AccordionItemProps) => {
  return (
    <RadixAccordion.Item value={value} className="w-full">
      {type === "handle" ? (
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
      ) : type === "button" ? (
        <RadixAccordion.Header className="w-full">
          <RadixAccordion.Trigger className="group w-full shrink-0 rounded p-1 text-slate-600 transition hover:bg-slate-100 hover:text-slate-600">
            <div className="grow">{title}</div>
          </RadixAccordion.Trigger>
        </RadixAccordion.Header>
      ) : (
        title
      )}
      <RadixAccordion.Content
        className="h-[var(--radix-accordion-content-height)] w-full animate-collapsibleSlideOut overflow-y-hidden transition-[height] data-[state=closed]:animate-accordionHide data-[state=open]:animate-accordionShow"
        style={{
          marginTop: `${gap}px`,
        }}
      >
        {children}
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  )
}
