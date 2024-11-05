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
    <div className="sticky top-0 z-10 bg-primary text-primary-content flex flex-row w-full p-1 items-center min-h-16">
      {children}
    </div>
  );
}

export default TopTitle;
