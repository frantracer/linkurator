type BoxProps = {
  title?: string;
  titleBackgroundColor?: string;
  borderColor?: string;
  children?: React.ReactNode;
}

const Box = (
  {
    title = "",
    children
  }: BoxProps) => {

  return (
    <div id={"my-box"} className={"border w-full rounded mt-2 border-primary"}>
      <div className={"-my-4 mx-2 px-2 w-fit rounded"}>
        {title}
      </div>
      <div className="mt-6 mb-4 px-4">
        {children}
      </div>
    </div>
  )
}

export default Box;
