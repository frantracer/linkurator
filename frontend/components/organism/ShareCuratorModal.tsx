import React from "react";
import Modal from "../atoms/Modal";
import {closeModal} from "../../utilities/modalAction";
import FlexColumn from "../atoms/FlexColumn";
import Button from "../atoms/Button";
import {useTranslations} from "next-intl";
import {LinkedinIcon, TwitterIcon} from "../atoms/Icons";

export const ShareCuratorModalId = "share-curator-modal";

type ShareCuratorModalProps = {
  curatorName: string;
  curatorUrl: string;
}

const ShareCuratorModal = (props: ShareCuratorModalProps) => {
  const t = useTranslations("common");

  const handleClose = () => {
    closeModal(ShareCuratorModalId);
  }

  const shareToTwitter = () => {
    const message = t("share_curator_twitter_message") + "\n\n";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(props.curatorUrl)}`;
    window.open(url, '_blank');
    handleClose();
  }

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(props.curatorUrl)}`;
    window.open(url, '_blank');
    handleClose();
  }

  return (
    <Modal id={ShareCuratorModalId} onClose={handleClose}>
      <FlexColumn position={"center"}>
        <h1 className="font-bold text-xl w-full text-center">{t("share")}</h1>
        <p className="text-center mb-4">{t("share_curator_description")}</p>
        <FlexColumn gap={2}>
          <Button fitContent={false} clickAction={shareToTwitter} primary={true}>
            <TwitterIcon/>
            {t("share_on_twitter")}
          </Button>
          <Button fitContent={false} clickAction={shareToLinkedIn} primary={false}>
            <LinkedinIcon/>
            {t("share_on_linkedin")}
          </Button>
        </FlexColumn>
      </FlexColumn>
    </Modal>
  )
}

export default ShareCuratorModal;
