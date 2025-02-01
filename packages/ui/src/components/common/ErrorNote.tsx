type ErrorNoteProps = {
  children: string
}

export const ErrorNote = ({ children }: ErrorNoteProps) => {
  return (
    <div className="rounded border border-red-300 bg-red-50 p-2.5 text-xs text-red-500">
      {children}
    </div>
  )
}
