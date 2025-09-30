import React from "react";

type SwapButtonProps = {
  onChange?: (isChecked: boolean) => void
  defaultChecked?: boolean
  tooltip?: string
  children?: React.ReactNode
}

const noAction = (b: boolean) => { // eslint-disable-line @typescript-eslint/no-unused-vars

}

export const SwapButton = (
  {
    onChange = noAction,
    defaultChecked = false,
    tooltip = undefined,
    children
  }: SwapButtonProps) => {
  const childrenArray = React.Children.toArray(children)
  const OnIcon = childrenArray[0]
  const OffIcon = childrenArray[1]

  return (
    <label className="swap swap-rotate" title={tooltip}>
      <input onChange={(e) => {
        onChange && onChange(e.target.checked)
      }} type="checkbox" defaultChecked={defaultChecked}/>
      <div className={"swap-on"}>{OnIcon}</div>
      <div className={"swap-off"}>{OffIcon}</div>
    </label>
  )
}
