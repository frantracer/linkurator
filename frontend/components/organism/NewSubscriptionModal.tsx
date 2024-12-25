import React, { useEffect, useState } from "react";
import Modal from "../atoms/Modal";
import Box from "../atoms/Box";
import FlexColumn from "../atoms/FlexColumn";
import SearchBar from "../molecules/SearchBar";
import { useDebounce } from "../../hooks/useDebounce";
import useFindSubscriptions from "../../hooks/useFindSubscriptions";
import FlexRow from "../atoms/FlexRow";
import ALink from "../atoms/ALink";
import { configuration, paths } from "../../configuration";
import Miniature from "../atoms/Miniature";
import { MenuItem } from "../atoms/MenuItem";
import Menu from "../atoms/Menu";
import Button from "../atoms/Button";
import { AddIcon, MinusIcon } from "../atoms/Icons";
import { followSubscription, unfollowSubscription } from "../../services/subscriptionService";
import { ErrorBanner } from "../atoms/ErrorBanner";
import { closeModal } from "../../utilities/modalAction";
import FlexItem from "../atoms/FlexItem";
import { providerIconUrl } from "../../entities/Subscription";
import { Tabs } from "../atoms/Tabs";
import { InfoBanner } from "../atoms/InfoBanner";
import { useRouter } from "next/navigation";


const NEW_SUBSCRIPTION_TAB = "Seguir"
const SYNC_SUBSCRIPTION_TAB = "Sincronizar"

export const NewSubscriptionModalId = "new-subscription-modal";

type NewSubscritionModalProps = {
  refreshSubscriptions: () => void;
}

const NewSubscriptionModal = (props: NewSubscritionModalProps) => {
  const router = useRouter();

  const tabsText = [NEW_SUBSCRIPTION_TAB, SYNC_SUBSCRIPTION_TAB];
  const [selectedTab, setSelectedTab] = useState(NEW_SUBSCRIPTION_TAB);

  const [subscriptionSearch, setSubscriptionSearch] = useState("");
  const debouncedSubscriptionSearch = useDebounce(subscriptionSearch, 500);

  const [unfollowError, setUnollowError] = useState<boolean>(false);

  const {
    subscriptions,
    subscriptionsAreLoading,
    refreshSubscriptions
  } = useFindSubscriptions(debouncedSubscriptionSearch);

  const handleFollow = (subscriptionUuid: string) => {
    followSubscription(subscriptionUuid).then(() => {
      refreshSubscriptions();
      props.refreshSubscriptions();
      setUnollowError(false);
    });
  }

  const handleUnfollow = (subscriptionUuid: string) => {
    unfollowSubscription(subscriptionUuid).then((resultOk) => {
      if (resultOk) {
        refreshSubscriptions();
        props.refreshSubscriptions();
        setUnollowError(false);
      } else {
        setUnollowError(true);
      }
    });
  }

  const handleYoutubeSync = () => {
    router.push(configuration.SUBSCRIPTIONS_YOUTUBE_SYNC_URL);
  }

  useEffect(() => {
    setUnollowError(false);
  }, [debouncedSubscriptionSearch]);

  const subItems = subscriptions.map((subscription) => {
    return (
      <MenuItem key={subscription.uuid} onClick={() => {
      }}>
        <FlexRow position={"start"} key={subscription.uuid}>
          <ALink href={paths.SUBSCRIPTIONS + "/" + subscription.uuid}
            onClick={() => closeModal(NewSubscriptionModalId)}>
            <FlexItem grow={true}>
              <FlexRow position={"start"}>
                <Miniature src={subscription.thumbnail} alt={subscription.name}
                  badgeImage={providerIconUrl(subscription.provider)} />
                <span>{subscription.name}</span>
              </FlexRow>
            </FlexItem>
          </ALink>
          <FlexItem grow={true} />
          {subscription.followed &&
            <Button clickAction={() => handleUnfollow(subscription.uuid)}>
              <MinusIcon />
              {"Dejar de seguir"}
            </Button>
          }
          {!subscription.followed &&
            <Button clickAction={() => handleFollow(subscription.uuid)}>
              <AddIcon />
              {"Seguir"}
            </Button>
          }
        </FlexRow>
      </MenuItem>
    )
  });

  return (
    <Modal id={NewSubscriptionModalId}>
      <Tabs tabsText={tabsText} selectedTab={selectedTab} onTabSelected={setSelectedTab} />
      {selectedTab === NEW_SUBSCRIPTION_TAB &&
        <FlexColumn>
          <FlexItem grow={true}>
            <SearchBar placeholder="Busca una subscripción por nombre o URL" value={subscriptionSearch}
              handleChange={setSubscriptionSearch} />
          </FlexItem>
          <Box title={"Subscripciones"}>
            <div className={"h-72 overflow-y-auto"}>
              {debouncedSubscriptionSearch === "" &&
                <FlexRow position={"center"}>{"Busca una subscripción por nombre o URL"}</FlexRow>
              }
              {subscriptionsAreLoading && <span>{"Cargando subscripciones..."}</span>}
              {subItems.length > 0 &&
                <Menu isFullHeight={true}>
                  {subItems}
                </Menu>
              }
              {subItems.length === 0 && !subscriptionsAreLoading && debouncedSubscriptionSearch !== "" &&
                <FlexRow position={"center"}>{"No se encontraron subscripciones"}</FlexRow>
              }
            </div>
          </Box>
          {unfollowError && <ErrorBanner>{"No puedes cancelar una subscripción asignada a una categoría"}</ErrorBanner>}
        </FlexColumn>
      }
      {selectedTab === SYNC_SUBSCRIPTION_TAB &&
        <FlexColumn>
          <Box title={"Sincronizar YouTube"}>
            <InfoBanner>
              <FlexColumn>
                <p><b>Aviso</b>: Nuestra app está siendo validada por YouTube. Puede aparecer un aviso al pulsar el botón, pero todo es completamente seguro. ¡Gracias por tu confianza!</p>
                <p><b>{"Configuración Avanzada > Ir a Linkurator Sync"}</b></p>
              </FlexColumn>
            </InfoBanner>
            <FlexRow position={"end"}>
              <Button clickAction={handleYoutubeSync}>{"(Beta) Sincronizar Canales de YouTube"}</Button>
            </FlexRow>
          </Box>
        </FlexColumn>
      }
    </Modal>
  )
}

export default NewSubscriptionModal;
