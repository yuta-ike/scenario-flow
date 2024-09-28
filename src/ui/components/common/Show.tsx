type ShowProps = {
  show: boolean
}

export const Show = ({ show }: ShowProps) => {
  if (show) {
    return <div>Show</div>
  } else {
    return null
  }
}
