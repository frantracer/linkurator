import React from "react";
import {CheckCircleIcon} from "./Icons";

type EndOfListProps = {
  text: string;
}

const EndOfList = ({text}: EndOfListProps) => {
  return (
    <p className="flex flex-row items-center justify-center gap-2 py-8 text-sm text-base-content/50">
      <CheckCircleIcon/>
      {text}
    </p>
  );
}

export default EndOfList;
