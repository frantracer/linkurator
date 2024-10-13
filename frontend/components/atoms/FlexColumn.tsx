type Position = "start" | "center" | "end";

type FlexColumnProps = {
  position?: Position;
  children?: React.ReactNode;
};

const FlexColumn = (
  {
    position = "start",
    children
  }: FlexColumnProps
) => {
  const positionMap = {
    "start": "items-start",
    "center": "items-center",
    "end": "items-end"
  }

  const positionClass = positionMap[position];

  return (
    <div className={`flex flex-col min-w-fit h-full gap-4 ${positionClass}`}>
      {children}
    </div>
  )
}

export default FlexColumn;
