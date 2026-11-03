import React from "react";
import Link from "next/link";

type EntityCardProps = {
  href: string;
  title: string;
  media: React.ReactNode;
  meta?: React.ReactNode;
  corner?: React.ReactNode;
  footerStart?: React.ReactNode;
  footerEnd?: React.ReactNode;
}

// Shared shell of topic, subscription and curator cards: the whole card links to the entity while
// the meta, corner and footer slots stay clickable above that link
const EntityCard = ({href, title, media, meta, corner, footerStart, footerEnd}: EntityCardProps) => {
  return (
    <article className="relative flex flex-col gap-3 w-full h-full p-4 rounded-xl border border-neutral bg-base-100
      transition duration-200 hover:z-10 hover:border-primary hover:shadow-xl motion-safe:hover:scale-105">
      <Link href={href} className="absolute inset-0 rounded-xl" aria-label={title}/>
      <div className="flex flex-row items-start gap-3">
        <div className="shrink-0">{media}</div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2">{title}</h3>
          {meta && <div className="relative z-10 text-xs text-base-content/70 min-w-0">{meta}</div>}
        </div>
        {corner && <div className="relative z-10 shrink-0">{corner}</div>}
      </div>
      {(footerStart || footerEnd) &&
          <div className="flex flex-row items-center justify-between gap-2 mt-auto">
              <span className="text-xs text-base-content/60">{footerStart}</span>
            {footerEnd && <div className="relative z-10 flex flex-row gap-1">{footerEnd}</div>}
          </div>
      }
    </article>
  );
}

export default EntityCard;
