'use client';

import React, {useEffect, useState} from "react";

type ClientOnlyProps = {
  children: React.ReactNode;
};

const ClientOnly = ({children}: ClientOnlyProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-dvh w-dvw">
        <span className="loading loading-spinner loading-lg"/>
      </div>
    );
  }

  return <>{children}</>;
};

export default ClientOnly;
