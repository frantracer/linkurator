import React from "react";
import Link from "next/link";
import {paths} from "../../configuration";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const AuthLayout = ({title, subtitle, footer, children}: AuthLayoutProps) => {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 px-4 py-10 bg-base-200">
      <Link href={paths.LANDING} className="flex flex-row items-center gap-2 text-xl font-bold">
        <img src="/logo_v1_medium.png" alt="" className="w-9 h-9"/>
        Linkurator
      </Link>
      <div className="w-full max-w-sm flex flex-col gap-5 p-6 rounded-2xl border border-neutral bg-base-100 shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-base-content/70">{subtitle}</p>}
        </div>
        {children}
      </div>
      {footer && <div className="w-full max-w-sm flex flex-col items-center gap-2 text-sm text-center">{footer}</div>}
    </main>
  );
}

export default AuthLayout;
