import React, {useState} from "react";
import Modal from "../atoms/Modal";
import {closeModal} from "../../utilities/modalAction";
import Box from "../atoms/Box";
import FlexRow from "../atoms/FlexRow";
import FlexColumn from "../atoms/FlexColumn";
import SearchBar from "../molecules/SearchBar";
import Avatar from "../atoms/Avatar";
import {useSearchCurators} from "../../hooks/useSearchCurators";
import {ErrorBanner} from "../atoms/ErrorBanner";
import {useDebounce} from "../../hooks/useDebounce";
import {paths} from "../../configuration";
import {followCurator, unfollowCurator} from "../../services/curatorService";
import Button from "../atoms/Button";
import {Curator} from "../../entities/Curators";
import ALink from "../atoms/ALink";
import FlexItem from "../atoms/FlexItem";
import {useTranslations} from "next-intl";

export const FindCuratorModalId = "find-curator-modal";

type FindCuratorModalProps = {
  curators: Curator[];
  refreshCurators: () => void;
}

const FindCuratorModal = (props: FindCuratorModalProps) => {
  const t = useTranslations("common");
  const [curatorSearch, setCuratorSearch] = useState("");
  const debouncedCuratorSearch = useDebounce(curatorSearch, 500);

  const {
    curators: searchedCurators,
    curatorsAreLoading: isLoading,
    refreshCurators: refreshSearchedCurators
  } = useSearchCurators(debouncedCuratorSearch);

  const displayCurators = debouncedCuratorSearch === "" ? [] : searchedCurators;

  const handleFollowCurator = (curatorId: string) => {
    followCurator(curatorId).then(() => {
      props.refreshCurators();
      refreshSearchedCurators();
    });
  }

  const handleUnfollowCurator = (curatorId: string) => {
    unfollowCurator(curatorId).then(() => {
      props.refreshCurators();
      refreshSearchedCurators();
    });
  }

  const handleClose = () => {
    setCuratorSearch("");
    closeModal(FindCuratorModalId);
  }

  return (
    <Modal id={FindCuratorModalId} onClose={handleClose}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">{t("find_curators")}</h1>
        <FlexItem grow={true}>
          <SearchBar placeholder={t("search_curator")} value={curatorSearch}
                     handleChange={setCuratorSearch}/>
        </FlexItem>
        <Box title={""}>
          <div className="h-80 overflow-y-auto overflow-x-hidden">
            <FlexColumn position={"center"}>
              {debouncedCuratorSearch !== "" && displayCurators.length === 0 && !isLoading &&
                  <ErrorBanner>{t("curator_not_found", { curator: debouncedCuratorSearch })}</ErrorBanner>
              }
              {isLoading && <span>{t("loading")}</span>}
              {displayCurators.map((curator) => (
                <FlexRow key={curator.id}>
                  <ALink href={paths.CURATORS + "/" + curator.username} onClick={handleClose}>
                    <FlexRow>
                      <Avatar src={curator.avatar_url} alt={curator.username}/>
                      <span>{curator.username}</span>
                    </FlexRow>
                  </ALink>
                  <FlexItem grow={true}></FlexItem>
                  {!curator.followed &&
                      <Button fitContent={true} clickAction={() => handleFollowCurator(curator.id)}>{t("follow")}</Button>
                  }
                  {curator.followed &&
                      <Button fitContent={true}
                              clickAction={() => handleUnfollowCurator(curator.id)}>{t("unfollow")}</Button>
                  }
                </FlexRow>
              ))}
            </FlexColumn>
          </div>
        </Box>
      </FlexColumn>
    </Modal>
  )
}

export default FindCuratorModal;