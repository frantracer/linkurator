import {ExclamationCircle} from "./Icons";
import FlexRow from "./FlexRow";

type ErrorBannerProps = {
  children: React.ReactNode;
}

export const ErrorBanner = ({children}: ErrorBannerProps) => {
  return (
    <div role="alert" className="alert alert-error w-fit p-2 m-1">
      <FlexRow>
        <ExclamationCircle/>
        {children}
      </FlexRow>
    </div>
  );
}
