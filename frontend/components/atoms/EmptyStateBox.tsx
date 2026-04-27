import React from "react";

type EmptyStateBoxProps = {
  title: string;
  message: string;
  children?: React.ReactNode;
}

const EmptyStateBox = ({title, message, children}: EmptyStateBoxProps) => {
  return (
    <div className="bg-base-200 rounded-lg p-6 text-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-base-content/70 mb-4">{message}</p>
      {children}
    </div>
  );
}

export default EmptyStateBox;
