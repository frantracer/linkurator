import {useTranslations} from "next-intl";
import {useToast} from "../contexts/ToastContext";

// Uses the device share sheet when there is one and falls back to copying the page link
const useShareLink = (title: string) => {
  const t = useTranslations("common");
  const {showToast} = useToast();

  return async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({title: title, url: url});
        return;
      } catch {
        // Cancelled or unsupported payload: fall through to copying
      }
    }
    await navigator.clipboard.writeText(url);
    showToast(t("link_copied"), url);
  };
};

export default useShareLink;
