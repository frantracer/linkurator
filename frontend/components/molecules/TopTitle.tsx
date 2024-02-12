import React from "react";

type TopTitleProps = {
  title: string,
  thumbnail?: string | undefined,
  onTitleClick?: () => void,
  children?: React.ReactNode,
}

const TopTitle = (
  {
    title,
    thumbnail = undefined,
    onTitleClick = undefined,
    children
  }: TopTitleProps
) => {
  const nodes = React.Children.toArray(children);
  const firstChild = nodes.length > 0 ? nodes[0] : undefined;
  const secondChild = nodes.length > 1 ? nodes[1] : undefined;

  let titleClass = "text-2xl md:text-4xl truncate font-bold m-auto";
  if (onTitleClick !== undefined) {
    titleClass += " cursor-pointer hover:underline";
  }

  return (
    <div className="sticky top-0 z-10 bg-primary text-primary-content flex flex-row justify-between w-full p-2">
      {firstChild !== undefined &&
          <div className="flex items-start">
            {firstChild}
          </div>
      }
      <div className="flex flex-row">
        {thumbnail !== undefined &&
            <img className="h-12 p-1 rounded" src={thumbnail} alt={title + " icon"}/>}
        <h1 onClick={onTitleClick} className={titleClass}>
          {title}
        </h1>
      </div>
      {secondChild !== undefined &&
          <div className="flex flex-column">
            {secondChild}
          </div>
      }
    </div>
  );
}

export default TopTitle;
