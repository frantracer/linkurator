import {useTranslations} from "next-intl";
import {readableAgoUnits} from "../utilities/dateFormatter";

const useAgoText = (): (date: Date) => string => {
  const t = useTranslations("common");
  return (date: Date) => {
    const ago = readableAgoUnits(date);
    return t("ago_label", {value: ago.value, unit: t(ago.unit)});
  };
}

export default useAgoText;
