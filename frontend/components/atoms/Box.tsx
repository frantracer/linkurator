type BoxProps = {
  title?: string;
  children?: React.ReactNode;
}

const Box = (
  {
    title = "",
    children
  }: BoxProps) => {

  return (
    <section className={"w-full flex flex-col gap-2 py-2"}>
      {title && (
        <h3 className={"text-sm font-semibold text-base-content/70"}>
          {title}
        </h3>
      )}
      <div className={"w-full"}>
        {children}
      </div>
    </section>
  )
}

export default Box;
