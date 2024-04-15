import React from "react";

type TopTitleProps = {
  children?: React.ReactNode,
}

const TopTitle = (
  {
    children
  }: TopTitleProps
) => {
  return (
    <div className="sticky top-0 z-10 bg-primary flex flex-row justify-between w-full p-1 items-center min-h-14">
      {children}
    </div>
  );
}

export default TopTitle;
