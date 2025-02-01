type FormItemProps = {
  id: string
  label: string
  children: React.ReactNode
  required?: boolean
  asFieldset?: boolean
}

export const FormItem = ({
  id,
  label,
  children,
  required = false,
  asFieldset = false,
}: FormItemProps) => {
  const Component = asFieldset ? "fieldset" : "div"
  const Label = asFieldset ? "legend" : "label"
  return (
    <Component className="flex flex-col gap-1 text-slate-700">
      <div>
        <Label htmlFor={id} className="text-sm">
          {label}
          {required && (
            <span className="text-red-500" aria-label="必須">
              {" "}
              *
            </span>
          )}
        </Label>
      </div>
      <div>{children}</div>
    </Component>
  )
}
