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
        items-center h-20 border-b-[1px] border-neutral">
      {children}
    </div>
  );
}

export default TopTitle;
