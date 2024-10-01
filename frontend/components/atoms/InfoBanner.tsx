import {CheckCircleIcon} from "./Icons";

type InfoBannerProps = {
  children: React.ReactNode;
}

export const InfoBanner = ({children}: InfoBannerProps) => {
  return (
    <div role="alert" className="alert alert-info">
      <CheckCircleIcon/>
      {children}
    </div>
  );
}
