import React from "react";

type TagProps = {
  children?: React.ReactNode;
}

const Tag = (props: TagProps) => {
  return (
    <div className="badge badge-primary badge-outline h-fit w-fit py-1 justify-start items-center text-wrap text-sm">
      <div className="flex flex-row gap-2 items-center justify-center font-semibold">
        {props.children}
      </div>
    </div>
  )
}

export default Tag;
