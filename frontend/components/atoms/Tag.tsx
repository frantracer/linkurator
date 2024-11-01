import React from "react";

type TagProps = {
  children?: React.ReactNode;
}

const Tag = (props: TagProps) => {
  return (
    <div className="badge badge-secondary h-fit w-fit max-w-full py-1 text-primary-content justify-start items-center
   overflow-auto truncate whitespace-nowrap text-sm">
      <div className="flex flex-row gap-2 items-center justify-center">
        {props.children}
      </div>
    </div>
  )
}

export default Tag;
