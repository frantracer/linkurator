import React from 'react';

type CollapseProps = {
  isOpen: boolean;
  title: React.ReactNode;
  content: React.ReactNode;
};

const Collapse = ({ isOpen, title, content }: CollapseProps) => {
  return (
    <details className="collapse collapse-arrow rounded-lg" open={isOpen}>
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
