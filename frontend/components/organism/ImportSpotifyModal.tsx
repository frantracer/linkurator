import React, {useState} from "react";
import {useTranslations} from "next-intl";
import Modal from "../atoms/Modal";
import Box from "../atoms/Box";
import Button from "../atoms/Button";
import FlexColumn from "../atoms/FlexColumn";
import FlexRow from "../atoms/FlexRow";
import InputText, {InputType} from "../atoms/InputText";
import {Spinner} from "../atoms/Spinner";
import {closeModal} from "../../utilities/modalAction";
import {requestSpotifyImport} from "../../services/subscriptionService";

export const ImportSpotifyModalId = "import-spotify-modal";

type ImportState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "error" };

const ImportSpotifyModal = () => {
  const t = useTranslations("common");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<ImportState>({status: "idle"});

  const handleClose = () => {
    setName("");
    setEmail("");
    setState({status: "idle"});
    closeModal(ImportSpotifyModalId);
  }

  const handleSubmit = () => {
    setState({status: "loading"});
    requestSpotifyImport(name.trim(), email.trim()).then((result) => {
      if (result.status === "authorize") {
        window.location.href = result.authorizationUrl;
      } else {
        setState({status: result.status});
      }
    });
  }

  return (
    <Modal id={ImportSpotifyModalId} onClose={handleClose}>
      <h1 className="font-bold text-xl w-full text-center mb-4">{t("import_spotify_title")}</h1>
      <FlexColumn position={"center"}>
        {state.status === "loading"
          ? <Spinner/>
          : (
            <>
              <Box title="">
                <FlexColumn position={"center"}>
                  <span className={"text-sm"}>{t("import_spotify_explanation")}</span>
                  <InputText placeholder={t("import_spotify_name")} value={name} onChange={setName}/>
                  <InputText placeholder={t("import_spotify_email")} value={email} onChange={setEmail}
                             inputType={InputType.EMAIL}/>
                </FlexColumn>
              </Box>
              {state.status === "unavailable" && (
                <span className={"text-error"}>{t("import_spotify_unavailable")}</span>
              )}
              {state.status === "error" && (
                <span className={"text-error"}>{t("import_spotify_error")}</span>
              )}
              <FlexRow position={"center"}>
                <Button clickAction={handleClose} primary={false}>
                  <span>{t("cancel")}</span>
                </Button>
                <Button clickAction={handleSubmit} disabled={name.trim() === "" || email.trim() === ""}>
                  <span>{t("import")}</span>
                </Button>
              </FlexRow>
            </>
          )}
      </FlexColumn>
    </Modal>
  )
}

export default ImportSpotifyModal;
