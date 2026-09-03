import {MenuItem} from "../atoms/MenuItem";
import {Subscription, subscriptionSorting} from "../../entities/Subscription";
import {getProviderIcon, getProviderPrettyName, Provider} from "../../entities/Provider";
import {useRouter} from "next/navigation";
import {paths} from "../../configuration";
import {scrollToDrawerTop} from "../../utilities/scrollToDrawerTop";
import Menu from "../atoms/Menu";
import React from "react";
import {Topic} from "../../entities/Topic";
import Miniature from "../atoms/Miniature";
import {InfoBanner} from "../atoms/InfoBanner";
import FlexRow from "../atoms/FlexRow";
import Collapse from "../atoms/Collapse";
import {useTranslations} from "next-intl";

type LateralItemListProps = {
  subscriptions: Subscription[];
  topics: Topic[];
  providers: Provider[];
  isLoading: boolean;
  selectedSubscription: Subscription | undefined;
  closeMenu: () => void;
  openImportModal: () => void;
}

const LateralSubscriptionList = (props: LateralItemListProps) => {
  const t = useTranslations("common");
  const router = useRouter()
  const handleClick = (subscriptionId: string) => {
    const subscription = props.subscriptions.find((subscription) => subscription.uuid === subscriptionId);
    if (subscription) {
      props.closeMenu()
      scrollToDrawerTop()
      router.push(paths.SUBSCRIPTIONS + "/" + subscription.uuid)
    }
  }

  // Group subscriptions by provider dynamically
  const subscriptionsByProvider = props.providers.map((provider) => {
    const subs = props.subscriptions
      .filter((subscription) => subscription.provider === provider.name)
      .sort(subscriptionSorting);

    const items = subs.map((subscription) => (
      <MenuItem
        key={subscription.uuid}
        onClick={() => handleClick(subscription.uuid)}
        selected={subscription.uuid === props.selectedSubscription?.uuid}
      >
        <FlexRow>
          <Miniature src={subscription.thumbnail} alt={subscription.name}/>
          <div className="whitespace-nowrap overflow-auto text-wrap w-full">{subscription.name}</div>
        </FlexRow>
      </MenuItem>
    ));

    const title = (
      <FlexRow position={"start"}>
        <Miniature src={getProviderIcon(props.providers, provider.name)} alt={`${provider.name} logo`}/>
        <span className="text-sm font-semibold text-base-content/70 tracking-wide">
          {getProviderPrettyName(props.providers, provider.name)} ({items.length})
        </span>
      </FlexRow>
    );

    return { provider, items, title };
  });

  const noItems = (
    <div className="flex flex-col items-center h-fit gap-2 p-1">
      <InfoBanner>
        <span className={"text-sm"}>{t("no_subscriptions_found")}</span>
      </InfoBanner>
    </div>
  )

  const hasAnyItems = subscriptionsByProvider.some(({ items }) => items.length > 0);

  return (
    <Menu>
      {subscriptionsByProvider.map(({ provider, items, title }) => (
        items.length > 0 && (
          <Collapse key={provider.name} isOpen={true} title={title} content={items}/>
        )
      ))}
      {!hasAnyItems && !props.isLoading && noItems}
    </Menu>
  )
}

export default LateralSubscriptionList;
