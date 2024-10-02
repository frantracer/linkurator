import {ExclamationCircle} from "./Icons";

type ErrorBannerProps = {
  children: React.ReactNode;
}

export const ErrorBanner = ({children}: ErrorBannerProps) => {
  return (
    <div role="alert" className="alert alert-error w-fit p-2 m-1">
      <ExclamationCircle/>
      {children}
    </div>
  );
}
