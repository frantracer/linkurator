import React from "react";

type TagProps = {
  children?: React.ReactNode;
}

const Tag = (props: TagProps) => {
  return <div className="badge badge-secondary h-fit w-fit py-1 text-primary-content whitespace-nowrap">
    <div className="flex flex-row gap-2 items-center justify-center">
      {props.children}
    </div>
  </div>
}

export default Tag;
