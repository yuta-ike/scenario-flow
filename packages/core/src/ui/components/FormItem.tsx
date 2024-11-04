type FormItemProps = {
  id: string
  label: string
  children: React.ReactNode
  asFieldset?: boolean
}

export const FormItem = ({
  id,
  label,
  children,
  asFieldset = false,
}: FormItemProps) => {
  const Component = asFieldset ? "fieldset" : "div"
  const Label = asFieldset ? "legend" : "label"
  return (
    <Component className="flex flex-col gap-1 text-slate-700">
      <div>
        <Label htmlFor={id} className="text-sm">
          {label}
        </Label>
      </div>
      <div>{children}</div>
    </Component>
  )
}
