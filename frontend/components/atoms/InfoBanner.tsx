import {InfoCircleIcon} from "./Icons";
import FlexRow from "./FlexRow";

type InfoBannerProps = {
  children: React.ReactNode;
}

export const InfoBanner = ({children}: InfoBannerProps) => {
  return (
    <div role="alert" className="alert alert-info w-fit p-2 m-1">
      <FlexRow>
        <InfoCircleIcon/>
        {children}
      </FlexRow>
    </div>
  );
}
