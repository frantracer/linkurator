import React from 'react';
import classNames from "classnames";

type CollapseProps = {
  isOpen: boolean;
  title: React.ReactNode;
  content: React.ReactNode;
  onToggle?: (isOpen: boolean) => void;
  flush?: boolean;
};

// A flush collapse drops its side padding so its title and content line up with the content around it
const Collapse = ({ isOpen, title, content, onToggle, flush = false }: CollapseProps) => {
  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    if (onToggle) {
      onToggle(event.currentTarget.open);
    }
  };

  return (
    <details className={classNames("collapse collapse-arrow rounded-lg bg-transparent", {"overflow-visible": flush})}
             open={isOpen} onToggle={handleToggle}>
      <summary className={classNames("collapse-title", {"pl-0": flush})}>
        {title}
      </summary>
      <div className={classNames("collapse-content", {"px-0": flush})}>
        {content}
      </div>
    </details>
  );
};

export default Collapse;
