import React from 'react';

type CollapseProps = {
  isOpen: boolean;
  title: React.ReactNode;
  content: React.ReactNode;
  onToggle?: (isOpen: boolean) => void;
};

const Collapse = ({ isOpen, title, content, onToggle }: CollapseProps) => {
  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    if (onToggle) {
      onToggle(event.currentTarget.open);
    }
  };

  return (
    <details className="collapse collapse-arrow rounded-lg bg-transparent" open={isOpen} onToggle={handleToggle}>
      <summary className="collapse-title">
        {title}
      </summary>
      <div className="collapse-content">
        {content}
      </div>
    </details>
  );
};

export default Collapse;
