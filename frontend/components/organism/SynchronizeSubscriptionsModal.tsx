import React from "react";
import Modal from "../atoms/Modal";
import Box from "../atoms/Box";
import FlexColumn from "../atoms/FlexColumn";
import FlexRow from "../atoms/FlexRow";
import Miniature from "../atoms/Miniature";
import Button from "../atoms/Button";
import {providerIconUrl} from "../../entities/Subscription";
import {configuration} from "../../configuration";
import {closeModal} from "../../utilities/modalAction";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import Card from "../molecules/Card";

export const SynchronizeSubscriptionsModalId = "synchronize-subscriptions-modal";

const SynchronizeSubscriptionsModal = () => {
  const t = useTranslations("common");
  const router = useRouter();

  const handleYoutubeSync = () => {
    router.push(configuration.SUBSCRIPTIONS_YOUTUBE_SYNC_URL);
    closeModal(SynchronizeSubscriptionsModalId);
  }

  const handleClose = () => {
    closeModal(SynchronizeSubscriptionsModalId);
  }

  return (
    <Modal id={SynchronizeSubscriptionsModalId} onClose={handleClose}>
      <h1 className="font-bold text-xl w-full text-center">{t("sync_subscriptions")}</h1>
      <FlexColumn>
          <Box title={""}>
              <div className={"h-72 overflow-y-auto"}>
                  <FlexColumn position={"center"}>
                      <Card title={<FlexRow position={"center"}>
                        <Miniature src={providerIconUrl("youtube")} alt={"youtube logo"}/>
                        <span>{"YouTube"}</span>
                      </FlexRow>}>
                          <FlexRow position={"center"}>
                              <Button clickAction={handleYoutubeSync}>
                                {t("sync")}
                              </Button>
                          </FlexRow>
                      </Card>
                      <Card title={<FlexRow position={"center"}>
                        <Miniature src={providerIconUrl("spotify")} alt={"spotify logo"}/>
                        <span>{"Spotify"}</span>
                      </FlexRow>}>
                          <FlexRow position={"center"}>
                              <Button disabled={true}>
                                  <span>{t("soon")}</span>
                              </Button>
                          </FlexRow>
                      </Card>
                  </FlexColumn>
              </div>
          </Box>
      </FlexColumn>
    </Modal>
  )
}

export default SynchronizeSubscriptionsModal;