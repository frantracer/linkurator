type BoxProps = {
  title?: string;
  titleBackgroundColor?: string;
  borderColor?: string;
  children?: React.ReactNode;
}

const Box = (
  {
    title = "",
    titleBackgroundColor = "bg-black",
    borderColor = "border-primary",
    children
  }: BoxProps) => {
  return (
    <div id={"my-box"} className={"border w-full rounded bg-transparent mt-2 " + borderColor}>
      <div className={"-my-4 mx-2 px-2 w-fit rounded " + titleBackgroundColor}>
        {title}
      </div>
      <div className="pt-6 pb-4 px-4">
        {children}
      </div>
    </div>
  )
}

export default Box;
