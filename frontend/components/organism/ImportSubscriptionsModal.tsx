import React, {useEffect, useId, useState} from "react";
import {useRouter} from "next/navigation";
import {useQueryClient} from "@tanstack/react-query";
import {useTranslations} from "next-intl";
import Modal from "../atoms/Modal";
import Button from "../atoms/Button";
import InputText, {InputType} from "../atoms/InputText";
import {ChevronLeftIcon} from "../atoms/Icons";
import ImportProviderTiles from "../molecules/ImportProviderTiles";
import {paths} from "../../configuration";
import {closeModal, openModal} from "../../utilities/modalAction";
import {ImportStep, OPEN_IMPORT_MODAL_EVENT} from "../../utilities/importModalAction";
import {importOpmlSubscriptions, requestSpotifyImport} from "../../services/subscriptionService";
import {invalidateTopicsCache} from "../../hooks/useTopics";
import {NewTopicModalId} from "./TopicEditorModal";

export const ImportSubscriptionsModalId = "import-subscriptions-modal";

type SpotifyState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "error" };

type OpmlState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; imported: number; topicsCreated: number }
  | { status: "error" };

type ImportSubscriptionsModalProps = {
  refreshSubscriptions: () => void;
}

const ImportSubscriptionsModal = ({refreshSubscriptions}: ImportSubscriptionsModalProps) => {
  const t = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();
  const fieldId = useId();

  const [step, setStep] = useState<ImportStep>("choose");
  const [spotifyName, setSpotifyName] = useState("");
  const [spotifyEmail, setSpotifyEmail] = useState("");
  const [spotifyState, setSpotifyState] = useState<SpotifyState>({status: "idle"});
  const [opmlFile, setOpmlFile] = useState<File | null>(null);
  const [createTopics, setCreateTopics] = useState(false);
  const [opmlState, setOpmlState] = useState<OpmlState>({status: "idle"});

  useEffect(() => {
    const handleOpenEvent = (event: Event) => {
      setStep((event as CustomEvent<ImportStep>).detail);
      openModal(ImportSubscriptionsModalId);
    };
    window.addEventListener(OPEN_IMPORT_MODAL_EVENT, handleOpenEvent);
    return () => window.removeEventListener(OPEN_IMPORT_MODAL_EVENT, handleOpenEvent);
  }, []);

  const reset = () => {
    setStep("choose");
    setSpotifyName("");
    setSpotifyEmail("");
    setSpotifyState({status: "idle"});
    setOpmlFile(null);
    setCreateTopics(false);
    setOpmlState({status: "idle"});
  };

  const submitSpotify = () => {
    setSpotifyState({status: "loading"});
    requestSpotifyImport(spotifyName.trim(), spotifyEmail.trim()).then((result) => {
      if (result.status === "authorize") {
        window.location.href = result.authorizationUrl;
      } else {
        setSpotifyState({status: result.status});
      }
    });
  };

  const submitOpml = () => {
    if (!opmlFile) {
      return;
    }
    setOpmlState({status: "loading"});
    importOpmlSubscriptions(opmlFile, createTopics).then((result) => {
      if (result) {
        refreshSubscriptions();
        if (result.topicsCreated > 0) {
          invalidateTopicsCache(queryClient);
        }
        setOpmlState({status: "success", imported: result.imported, topicsCreated: result.topicsCreated});
      } else {
        setOpmlState({status: "error"});
      }
    });
  };

  const viewSubscriptions = () => {
    closeModal(ImportSubscriptionsModalId);
    router.push(paths.SUBSCRIPTIONS);
  };

  const createTopic = () => {
    closeModal(ImportSubscriptionsModalId);
    openModal(NewTopicModalId);
  };

  const title = step === "spotify"
    ? t("import_spotify_title")
    : step === "opml" ? t("import_opml_title") : t("import_subscriptions");

  const backButton = (
    <Button primary={false} borderless={true} clickAction={() => setStep("choose")}>
      <ChevronLeftIcon/>
      {t("back")}
    </Button>
  );

  return (
    <Modal id={ImportSubscriptionsModalId} title={title} size={step === "choose" ? "lg" : "md"} onClose={reset}>
      {step === "choose" &&
          <div className="flex flex-col gap-3">
              <p className="text-sm text-base-content/70">{t("import_subscriptions_providers")}</p>
              <ImportProviderTiles onChooseStep={setStep} columns={2}/>
          </div>
      }

      {step === "spotify" &&
          <form className="flex flex-col gap-4" onSubmit={(event) => {
            event.preventDefault();
            submitSpotify();
          }}>
              <p className="text-sm text-base-content/70">{t("import_spotify_explanation")}</p>
              <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor={fieldId + "-name"}>
                {t("import_spotify_name")}
                  <InputText id={fieldId + "-name"} placeholder={t("import_spotify_name")} value={spotifyName}
                             onChange={setSpotifyName} autoComplete={"name"} required={true}/>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor={fieldId + "-email"}>
                {t("import_spotify_email")}
                  <InputText id={fieldId + "-email"} placeholder={t("import_spotify_email")} value={spotifyEmail}
                             onChange={setSpotifyEmail} inputType={InputType.EMAIL} autoComplete={"email"}
                             required={true}/>
              </label>
            {spotifyState.status === "unavailable" &&
                <p role="alert" className="text-sm text-error">{t("import_spotify_unavailable")}</p>}
            {spotifyState.status === "error" &&
                <p role="alert" className="text-sm text-error">{t("import_spotify_error")}</p>}
              <div className="flex flex-row justify-between gap-2">
                {backButton}
                  <Button submit={true}
                          disabled={spotifyState.status === "loading" || spotifyName.trim() === "" || spotifyEmail.trim() === ""}>
                    {spotifyState.status === "loading" && <span className="loading loading-spinner loading-xs"/>}
                    {t("import")}
                  </Button>
              </div>
          </form>
      }

      {step === "opml" && opmlState.status !== "success" &&
          <form className="flex flex-col gap-4" onSubmit={(event) => {
            event.preventDefault();
            submitOpml();
          }}>
              <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor={fieldId + "-file"}>
                {t("opml_file")}
                  <input id={fieldId + "-file"} type="file" accept=".opml,.xml"
                         onChange={(event) => setOpmlFile(event.target.files?.[0] ?? null)}
                         className="file-input file-input-bordered file-input-sm w-full"/>
              </label>
              <label className="flex flex-row gap-2 items-center text-sm">
                  <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" checked={createTopics}
                         onChange={(event) => setCreateTopics(event.target.checked)}/>
                {t("import_opml_create_topics")}
              </label>
            {opmlState.status === "loading" &&
                <p role="status" className="flex flex-row items-center gap-2 text-sm text-base-content/70">
                    <span className="loading loading-spinner loading-sm"/>
                  {t("import_opml_loading")} {t("import_opml_loading_hint")}
                </p>
            }
            {opmlState.status === "error" && <p role="alert" className="text-sm text-error">{t("import_opml_error")}</p>}
              <div className="flex flex-row justify-between gap-2">
                {backButton}
                  <Button submit={true} disabled={!opmlFile || opmlState.status === "loading"}>
                    {t("import")}
                  </Button>
              </div>
          </form>
      }

      {step === "opml" && opmlState.status === "success" &&
          <div className="flex flex-col gap-4">
              <p role="status">
                {opmlState.topicsCreated > 0
                  ? t("import_opml_success_with_topics", {count: opmlState.imported, topics: opmlState.topicsCreated})
                  : t("import_opml_success", {count: opmlState.imported})}
              </p>
              <div className="flex flex-row justify-end gap-2">
                  <Button primary={false} clickAction={createTopic}>{t("create_topic")}</Button>
                  <Button clickAction={viewSubscriptions}>{t("view_subscriptions")}</Button>
              </div>
          </div>
      }
    </Modal>
  );
}

export default ImportSubscriptionsModal;
