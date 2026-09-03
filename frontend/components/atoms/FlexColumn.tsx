type Position = "start" | "center" | "end";

type FlexColumnProps = {
  position?: Position;
  gap?: number;
  children?: React.ReactNode;
};

const FlexColumn = (
  {
    position = "start",
    gap = 4,
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
    <div className={`flex flex-col h-full gap-${gap} ${positionClass}`}>
      {children}
    </div>
  )
}

export default FlexColumn;
