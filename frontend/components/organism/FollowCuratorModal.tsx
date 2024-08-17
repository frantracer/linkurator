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


export const FollowCuratorModalId = "follow-curator-modal";

type FolowCuratorModalProps = {
  curators: Curator[];
  refreshCurators: () => void;
}

const FolowCuratorModal = (props: FolowCuratorModalProps) => {
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

  return (
    <Modal id={FollowCuratorModalId}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">{"Seguir curador"}</h1>
        <SearchBar placeholder="Buscar curador de contenido" value={curatorSearch}
                   handleChange={setCuratorSearch}/>
        <Box title={"Curador"}>
          <FlexColumn>
            {debouncedCuratorSearch !== "" && curator === null && !curatorIsLoading &&
                <ErrorBanner>{"No se encontró el curador " + debouncedCuratorSearch}</ErrorBanner>
            }
            {curatorIsLoading && <span>{"Cargando..."}</span>}
            {curator !== null &&
                <ALink href={paths.CURATORS + "/" + curator.username} onClick={() => closeModal(FollowCuratorModalId)}>
                    <FlexRow>
                        <Avatar src={curator.avatar_url} alt={curator.username}/>
                        <span>{curator.username}</span>
                    </FlexRow>
                </ALink>
            }
            {curator !== null && !curator.followed &&
                <Button fitContent={false} clickAction={() => handleFollowCurator(curator.id)}>{"Seguir"}</Button>
            }
            {curator !== null && curator.followed &&
                <Button fitContent={false}
                        clickAction={() => handleUnfollowCurator(curator.id)}>{"Dejar de seguir"}</Button>
            }
            {debouncedCuratorSearch === "" &&
                <FlexRow position={"center"}>{"Busca un curador de contenido"}</FlexRow>
            }
          </FlexColumn>
        </Box>
      </FlexColumn>
    </Modal>
  )
}

export default FolowCuratorModal;
