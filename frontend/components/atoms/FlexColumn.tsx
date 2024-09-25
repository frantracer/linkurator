type FlexColumnProps = {
  children?: React.ReactNode;
};

const FlexColumn = (
  {
    children
  }: FlexColumnProps
) => {
  return (
    <div className={`flex flex-col min-w-fit h-full gap-4`}>
      {children}
    </div>
  )
}

export default FlexColumn;
