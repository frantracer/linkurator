"use client";

import type {NextPage} from "next";
import "../docs_styles.css"
import React from "react";
import { useTranslations } from "next-intl";
import FlexRow from "../../../components/atoms/FlexRow";
import LanguageSelector from "../../../components/molecules/LanguageSelector";
import LinkuratorHeader from "../../../components/organism/LinkuratorHeader";

const TermsOfService: NextPage = () => {
  const t = useTranslations("legal");

  return (
    <div className="flex w-full justify-center">
      <div className="max-w-screen-lg m-4">
        <FlexRow position="end">
          <LanguageSelector />
        </FlexRow>
        <LinkuratorHeader />

        <h1>{t("tos_title")}</h1>
        <p>{t("tos_date")}</p>
        <p>{t("tos_intro")}</p>

        <h2>{t("tos_subtitle_1")}</h2>
        <p>{t("tos_part_1_1")}</p>
        <p>{t("tos_part_1_2")}</p>

        <h2>{t("tos_subtitle_2")}</h2>
        <p>{t("tos_part_2_1")}</p>

        <h2>{t("tos_subtitle_3")}</h2>
        <p>{t("tos_part_3_1")}</p>
        <p>{t("tos_part_3_2")}</p>
        <p>{t("tos_part_3_3")}</p>

        <h2>{t("tos_subtitle_4")}</h2>
        <p>{t("tos_part_4_1")}</p>
      </div>
    </div>
  );
}

export default TermsOfService;
