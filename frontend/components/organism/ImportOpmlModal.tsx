import React, {useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {useTranslations} from "next-intl";
import Modal from "../atoms/Modal";
import Box from "../atoms/Box";
import Button from "../atoms/Button";
import FlexColumn from "../atoms/FlexColumn";
import FlexRow from "../atoms/FlexRow";
import {Spinner} from "../atoms/Spinner";
import {closeModal} from "../../utilities/modalAction";
import {importOpmlSubscriptions} from "../../services/subscriptionService";
import {invalidateTopicsCache} from "../../hooks/useTopics";

export const ImportOpmlModalId = "import-opml-modal";

type ImportOpmlModalProps = {
  refreshSubscriptions: () => void;
}

type ImportState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; imported: number; topicsCreated: number }
  | { status: "error" };

const ImportOpmlModal = ({refreshSubscriptions}: ImportOpmlModalProps) => {
  const t = useTranslations("common");
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [createTopics, setCreateTopics] = useState(false);
  const [state, setState] = useState<ImportState>({status: "idle"});

  const handleClose = () => {
    setFile(null);
    setCreateTopics(false);
    setState({status: "idle"});
    closeModal(ImportOpmlModalId);
  }

  const handleSubmit = () => {
    if (!file) {
      return;
    }
    setState({status: "loading"});
    importOpmlSubscriptions(file, createTopics).then((result) => {
      if (result) {
        refreshSubscriptions();
        if (result.topicsCreated > 0) {
          invalidateTopicsCache(queryClient);
        }
        setState({status: "success", imported: result.imported, topicsCreated: result.topicsCreated});
      } else {
        setState({status: "error"});
      }
    });
  }

  return (
    <Modal id={ImportOpmlModalId} onClose={handleClose}>
      <h1 className="font-bold text-xl w-full text-center mb-4">{t("import_opml_title")}</h1>
      <FlexColumn position={"center"}>
        {state.status === "loading" && (
          <>
            <FlexRow position={"center"}>
              <Spinner/>
              <span>{t("import_opml_loading")}</span>
            </FlexRow>
            <span className={"text-sm text-center"}>{t("import_opml_loading_hint")}</span>
          </>
        )}
        {state.status === "success" && (
          <>
            <span>
              {state.topicsCreated > 0
                ? t("import_opml_success_with_topics", {count: state.imported, topics: state.topicsCreated})
                : t("import_opml_success", {count: state.imported})}
            </span>
            <Button clickAction={handleClose}>
              <span>{t("accept")}</span>
            </Button>
          </>
        )}
        {(state.status === "idle" || state.status === "error") && (
          <>
            <Box title="">
              <FlexColumn position={"center"}>
                <input type="file"
                       accept=".opml,.xml"
                       onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                       className={"file-input file-input-bordered w-full"}/>
                <label className={"flex flex-row gap-2 items-center"}>
                  <input type="checkbox"
                         checked={createTopics}
                         onChange={(e) => setCreateTopics(e.target.checked)}
                         className={"checkbox"}/>
                  <span>{t("import_opml_create_topics")}</span>
                </label>
              </FlexColumn>
            </Box>
            {state.status === "error" && (
              <span className={"text-error"}>{t("import_opml_error")}</span>
            )}
            <FlexRow position={"center"}>
              <Button clickAction={handleClose} primary={false}>
                <span>{t("cancel")}</span>
              </Button>
              <Button clickAction={handleSubmit} disabled={!file}>
                <span>{t("import")}</span>
              </Button>
            </FlexRow>
          </>
        )}
      </FlexColumn>
    </Modal>
  )
}

export default ImportOpmlModal;
