import {useRouter} from 'next/router';
import React, {FC, ReactNode, MouseEvent} from 'react';

interface RedirectButtonProps {
  to: string;
  children: ReactNode;
}

const RedirectButton: FC<RedirectButtonProps> = ({to, children}) => {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.push(to);
  };

  const className = "btn btn-primary gap-2 m-1 w-full";

  return (
    <button className={className} onClick={handleClick}>
      {children}
    </button>
  );
};

export default RedirectButton;
