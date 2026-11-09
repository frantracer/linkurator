import React from "react";
import classNames from "classnames";

type PageFilterBarProps = {
  width: "wide" | "narrow";
  children: React.ReactNode;
}

// Sits between the page header and the scrolling content so the filters stay in view. Like the header, it keeps
// room for the content's scrollbar so its controls line up with the content below.
const PageFilterBar = ({width, children}: PageFilterBarProps) => (
  <div className="shrink-0 overflow-hidden [scrollbar-gutter:stable] bg-base-300 border-b border-neutral">
    <div className={classNames("flex flex-col sm:flex-row gap-3 sm:items-center px-4 py-3 w-full mx-auto", {
      "max-w-7xl": width === "wide",
      "max-w-2xl": width === "narrow",
    })}>
      {children}
    </div>
  </div>
);

export default PageFilterBar;
