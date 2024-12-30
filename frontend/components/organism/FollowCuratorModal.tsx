import React, {useState} from "react";
import Modal from "../atoms/Modal";
import {closeModal} from "../../utilities/modalAction";
import Box from "../atoms/Box";
import FlexRow from "../atoms/FlexRow";
import FlexColumn from "../atoms/FlexColumn";
import SearchBar from "../molecules/SearchBar";
import Avatar from "../atoms/Avatar";
import {useCurator} from "../../hooks/useCurator";
import {ErrorBanner} from "../atoms/ErrorBanner";
import {useDebounce} from "../../hooks/useDebounce";
import {paths} from "../../configuration";
import {followCurator, unfollowCurator} from "../../services/curatorService";
import Button from "../atoms/Button";
import {Curator} from "../../entities/Curators";
import ALink from "../atoms/ALink";
import FlexItem from "../atoms/FlexItem";
import {useTranslations} from "next-intl";

export const FollowCuratorModalId = "follow-curator-modal";

type FolowCuratorModalProps = {
  curators: Curator[];
  refreshCurators: () => void;
}

const FolowCuratorModal = (props: FolowCuratorModalProps) => {
  const t = useTranslations("common");
  const [curatorSearch, setCuratorSearch] = useState("");
  const debouncedCuratorSearch = useDebounce(curatorSearch, 500);

  const {
    curator,
    curatorIsLoading
  } = useCurator(debouncedCuratorSearch, props.curators);

  const handleFollowCurator = (curatorId: string) => {
    followCurator(curatorId).then(() => {
      props.refreshCurators();
    });
  }

  const handleUnfollowCurator = (curatorId: string) => {
    unfollowCurator(curatorId).then(() => {
      props.refreshCurators();
    });
  }

  const handleClose = () => {
    setCuratorSearch("");
    closeModal(FollowCuratorModalId);
  }

  return (
    <Modal id={FollowCuratorModalId} onClose={handleClose}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">{t("follow_curator")}</h1>
        <FlexItem grow={true}>
          <SearchBar placeholder={t("search_curator")} value={curatorSearch}
                     handleChange={setCuratorSearch}/>
        </FlexItem>
        <Box title={t("curator")}>
          <FlexColumn>
            {debouncedCuratorSearch !== "" && curator === null && !curatorIsLoading &&
                <ErrorBanner>{t("curator_not_found", { curator: debouncedCuratorSearch })}</ErrorBanner>
            }
            {curatorIsLoading && <span>{t("loading")}</span>}
            {curator !== null &&
                <ALink href={paths.CURATORS + "/" + curator.username} onClick={handleClose}>
                    <FlexRow>
                        <Avatar src={curator.avatar_url} alt={curator.username}/>
                        <span>{curator.username}</span>
                    </FlexRow>
                </ALink>
            }
            {curator !== null && !curator.followed &&
                <Button fitContent={false} clickAction={() => handleFollowCurator(curator.id)}>{t("follow")}</Button>
            }
            {curator !== null && curator.followed &&
                <Button fitContent={false}
                        clickAction={() => handleUnfollowCurator(curator.id)}>{t("unfollow")}</Button>
            }
            {debouncedCuratorSearch === "" &&
                <FlexRow position={"center"}>{t("search_curator_prompt")}</FlexRow>
            }
          </FlexColumn>
        </Box>
      </FlexColumn>
    </Modal>
  )
}

export default FolowCuratorModal;
