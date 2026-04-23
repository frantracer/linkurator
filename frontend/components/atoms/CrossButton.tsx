import React from "react";
import {CrossIcon} from "./Icons";

type CrossButtonProps = {
  onClick: () => void;
}

const CrossButton = ({onClick}: CrossButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <div className={"hover:text-primary cursor-pointer"} onClick={handleClick}>
      <CrossIcon/>
    </div>
  );
};

export default CrossButton;
