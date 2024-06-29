type Position = "start" | "center" | "end" | "between";

type FlexRowProps = {
  position?: Position;
  wrap?: boolean;
  children: React.ReactNode;
};

const FlexRow = (
  {
    position = "center",
    wrap = false,
    children
  } : FlexRowProps
) => {
  const positionClasses = {
    "start": "justify-start",
    "center": "justify-center",
    "between": "justify-between",
    "end": "justify-end"
  };

  const wrapClasses = wrap ? "flex-wrap" : "";

  return (
    <div className={`flex flex-row gap-2 items-center w-full ${wrapClasses} ${positionClasses[position]}`}>
      {children}
    </div>
  )
}

export default FlexRow;
