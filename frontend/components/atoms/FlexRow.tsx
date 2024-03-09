type Position = "start" | "center" | "end";

type FlexRowProps = {
  position?: Position;
  children: React.ReactNode;
};

const FlexRow = (
  {
    position = "center",
    children
  } : FlexRowProps
) => {
  const positionClasses = {
    "start": "justify-start",
    "center": "justify-between",
    "end": "justify-end"
  };

  return (
    <div className={`flex flex-row gap-2 items-center ${positionClasses[position]}`}>
      {children}
    </div>
  )
}

export default FlexRow;
