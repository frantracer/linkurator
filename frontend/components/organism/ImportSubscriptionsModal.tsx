import React from "react";
import Modal from "../atoms/Modal";
import Miniature from "../atoms/Miniature";
import Button from "../atoms/Button";
import {getProviderIcon} from "../../entities/Provider";
import useProviders from "../../hooks/useProviders";
import {configuration} from "../../configuration";
import {closeModal} from "../../utilities/modalAction";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import Box from "../atoms/Box";

export const ImportSubscriptionsModalId = "import-subscriptions-modal";

const ImportSubscriptionsModal = () => {
  const t = useTranslations("common");
  const router = useRouter();
  const {providers} = useProviders();

  const isProviderAvailable = (name: string) => providers.some((p) => p.name === name);

  const handleYoutubeImport = () => {
    router.push(configuration.SUBSCRIPTIONS_YOUTUBE_IMPORT_URL);
    closeModal(ImportSubscriptionsModalId);
  }

  const handlePatreonImport = () => {
    router.push(configuration.SUBSCRIPTIONS_PATREON_IMPORT_URL);
    closeModal(ImportSubscriptionsModalId);
  }

  const handleClose = () => {
    closeModal(ImportSubscriptionsModalId);
  }

  return (
    <Modal id={ImportSubscriptionsModalId} onClose={handleClose}>
      <h1 className="font-bold text-xl w-full text-center">{t("import_subscriptions")}</h1>
      <Box title="">
        <div className={"flex flex-col gap-5"}>
          <div/>
          {isProviderAvailable("youtube") && (
            <div className={"flex flex-row items-center justify-center gap-4 w-full"}>
              <Button clickAction={handleYoutubeImport}>
                <Miniature src={getProviderIcon(providers, "youtube")} alt={"youtube logo"}/>
                {t("import_from_youtube")}
              </Button>
            </div>
          )}
          {isProviderAvailable("patreon") && (
            <div className={"flex flex-row items-center justify-center gap-4 w-full"}>
              <Button clickAction={handlePatreonImport}>
                <Miniature src={getProviderIcon(providers, "patreon")} alt={"patreon logo"}/>
                {t("import_from_patreon")}
              </Button>
            </div>
          )}
          <div/>
        </div>
      </Box>
    </Modal>
  )
}

export default ImportSubscriptionsModal;
