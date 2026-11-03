type Position = "start" | "center" | "end";

type Gap = 1 | 2 | 4;

// Static class names so Tailwind can find them when scanning the source
const gapClasses: Record<Gap, string> = {
  1: "gap-1",
  2: "gap-2",
  4: "gap-4",
};

type FlexColumnProps = {
  position?: Position;
  gap?: Gap;
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
    <div className={`flex flex-col h-full ${gapClasses[gap]} ${positionClass}`}>
      {children}
    </div>
  )
}

export default FlexColumn;
