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
    <div className="sticky top-0 z-10 bg-base-100 text-base-content flex-none
        m-1 items-center min-h-16 border-b-2 border-neutral">
      {children}
    </div>
  );
}

export default TopTitle;
