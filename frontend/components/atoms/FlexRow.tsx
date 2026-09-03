type Position = "start" | "center" | "end" | "between";

type FlexRowProps = {
  position?: Position;
  wrap?: boolean;
  hideOverflow?: boolean;
  hideOnMobile?: boolean;
  children: React.ReactNode;
};

const FlexRow = (
  {
    position = "center",
    wrap = false,
    hideOverflow = false,
    hideOnMobile = false,
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
  const overflowClasses = hideOverflow ? "overflow-visible" : "";
  const hideOnMobileClasses = hideOnMobile ? "hidden lg:flex" : "";

  return (
    <div className={`flex flex-row gap-2 items-center h-fit w-full
     ${overflowClasses} ${wrapClasses} ${positionClasses[position]} ${hideOnMobileClasses}`}>
      {children}
    </div>
  )
}

export default FlexRow;
