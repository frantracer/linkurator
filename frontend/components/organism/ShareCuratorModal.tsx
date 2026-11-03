import React from "react";
import Modal from "../atoms/Modal";
import {closeModal} from "../../utilities/modalAction";
import FlexColumn from "../atoms/FlexColumn";
import Button from "../atoms/Button";
import {useTranslations} from "next-intl";
import {LinkedinIcon, ShareIcon, TwitterIcon} from "../atoms/Icons";
import {useToast} from "../../contexts/ToastContext";

export const ShareCuratorModalId = "share-curator-modal";

type ShareCuratorModalProps = {
  curatorName: string;
  curatorUrl: string;
}

const ShareCuratorModal = (props: ShareCuratorModalProps) => {
  const t = useTranslations("common");
  const {showToast} = useToast();

  const copyLink = async () => {
    await navigator.clipboard.writeText(props.curatorUrl);
    showToast(t("link_copied"), props.curatorUrl);
    handleClose();
  }

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
    const text = encodeURIComponent(t("share_curator_linkedin_message"));
    const curatorUrl = encodeURIComponent(props.curatorUrl);
    const url = `https://www.linkedin.com/feed/?shareActive=true&shareUrl=${curatorUrl}&text=${(text)}`;
    window.open(url, '_blank');
    handleClose();
  }

  return (
    <Modal id={ShareCuratorModalId} title={t("share")} size={"sm"} onClose={handleClose}>
      <FlexColumn>
        <p className="mb-2 text-base-content/80">{t("share_curator_description")}</p>
        <FlexColumn gap={2}>
          <Button fitContent={false} clickAction={copyLink} primary={true}>
            <ShareIcon/>
            {t("copy_link")}
          </Button>
          <Button fitContent={false} clickAction={shareToTwitter} primary={false}>
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
