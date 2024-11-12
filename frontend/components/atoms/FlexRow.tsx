type Position = "start" | "center" | "end" | "between";

type FlexRowProps = {
  position?: Position;
  wrap?: boolean;
  hideOverflow?: boolean;
  children: React.ReactNode;
};

const FlexRow = (
  {
    position = "center",
    wrap = false,
    hideOverflow = false,
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
  const overflowClasses = hideOverflow ? "overflow-hidden" : "";

  return (
    <div className={`flex flex-row gap-2 items-center h-fit w-full ${overflowClasses} ${wrapClasses} ${positionClasses[position]}`}>
      {children}
    </div>
  )
}

export default FlexRow;
