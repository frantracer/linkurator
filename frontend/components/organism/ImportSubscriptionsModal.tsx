import React from "react";
import Modal from "../atoms/Modal";
import Box from "../atoms/Box";
import FlexColumn from "../atoms/FlexColumn";
import Miniature from "../atoms/Miniature";
import Button from "../atoms/Button";
import {getProviderIcon} from "../../entities/Provider";
import useProviders from "../../hooks/useProviders";
import {configuration} from "../../configuration";
import {closeModal} from "../../utilities/modalAction";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";

export const ImportSubscriptionsModalId = "import-subscriptions-modal";

const ImportSubscriptionsModal = () => {
  const t = useTranslations("common");
  const router = useRouter();
  const {providers} = useProviders();

  const handleYoutubeImport = () => {
    router.push(configuration.SUBSCRIPTIONS_YOUTUBE_IMPORT_URL);
    closeModal(ImportSubscriptionsModalId);
  }

  const handleClose = () => {
    closeModal(ImportSubscriptionsModalId);
  }

  return (
    <Modal id={ImportSubscriptionsModalId} onClose={handleClose}>
      <h1 className="font-bold text-xl w-full text-center">{t("import_subscriptions")}</h1>
      <FlexColumn>
        <Box title={""}>
          <div className={"h-72 overflow-y-auto"}>
            <Box title="">
              <div className={"flex flex-row items-center justify-center gap-2"}>
                <Miniature src={getProviderIcon(providers, "youtube")} alt={"youtube logo"}/>
                <span className={"font-bold"}>{"YouTube"}</span>
              </div>
              <div className={"flex flex-row items-center justify-center gap-4"}>
                <Button clickAction={handleYoutubeImport}>
                  {t("import")}
                </Button>
              </div>
            </Box>
          </div>
        </Box>
      </FlexColumn>
    </Modal>
  )
}

export default ImportSubscriptionsModal;
