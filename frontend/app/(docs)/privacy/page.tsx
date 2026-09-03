"use client";

import type {NextPage} from "next";
import "../docs_styles.css"
import React from "react";
import { useTranslations } from "next-intl";
import LanguageSelector from "../../../components/molecules/LanguageSelector";
import FlexRow from "../../../components/atoms/FlexRow";
import LinkuratorHeader from "../../../components/organism/LinkuratorHeader";

const PrivacyPolicy: NextPage = () => {
  const t = useTranslations("legal");

  return (
    <div className="flex w-full justify-center">
      <div className="max-w-screen-lg m-4">
        <FlexRow position="end">
          <LanguageSelector />
        </FlexRow>
        <LinkuratorHeader />

        <h1>{t("privacy_policy_title")}</h1>
        <p>{t("privacy_policy_date")}</p>
        <p>{t("privacy_policy_intro")}</p>

        <h2>{t("privacy_policy_info_collect_title")}</h2>
        <p>{t("privacy_policy_info_collect_intro")}</p>
        <ul>
          <li>{t("privacy_policy_info_collect_list.name")}</li>
          <li>{t("privacy_policy_info_collect_list.last_name")}</li>
          <li>{t("privacy_policy_info_collect_list.email")}</li>
          <li>{t("privacy_policy_info_collect_list.youtube_account")}</li>
          <li>{t("privacy_policy_info_collect_list.youtube_subscriptions")}</li>
          <li>{t("privacy_policy_info_collect_list.chat_messages")}</li>
        </ul>
        <p>{t("privacy_policy_info_collect_usage")}</p>

        <h2>{t("privacy_policy_info_usage_title")}</h2>
        <p>{t("privacy_policy_info_usage_intro")}</p>
        <ul>
          <li>{t("privacy_policy_info_usage_list.provide")}</li>
          <li>{t("privacy_policy_info_usage_list.improve")}</li>
          <li>{t("privacy_policy_info_usage_list.analyze")}</li>
          <li>{t("privacy_policy_info_usage_list.develop")}</li>
          <li>{t("privacy_policy_info_usage_list.communicate")}</li>
          <li>{t("privacy_policy_info_usage_list.email")}</li>
        </ul>

        <h2>{t("privacy_policy_protection_title")}</h2>
        <p>{t("privacy_policy_protection_intro")}</p>
        <p>{t("privacy_policy_protection_note")}</p>

        <h2>{t("privacy_policy_third_party_services_title")}</h2>
        <p>{t("privacy_policy_third_party_services_intro")}</p>
        <p>{t("privacy_policy_third_party_services_ai")}</p>

        <h2>{t("privacy_policy_gdpr_title")}</h2>
        <p>{t("privacy_policy_gdpr_intro")}</p>
        <p>{t("privacy_policy_gdpr_legal_basis")}</p>
        <ul>
          <li>{t("privacy_policy_gdpr_legal_basis_list.consent")}</li>
          <li>{t("privacy_policy_gdpr_legal_basis_list.contract")}</li>
          <li>{t("privacy_policy_gdpr_legal_basis_list.legal_obligations")}</li>
          <li>{t("privacy_policy_gdpr_legal_basis_list.legitimate_interests")}</li>
        </ul>

        <h2>{t("privacy_policy_gdpr_rights_title")}</h2>
        <p>{t("privacy_policy_gdpr_rights_intro")}</p>
        <ul>
          <li>{t("privacy_policy_gdpr_rights_list.access")}</li>
          <li>{t("privacy_policy_gdpr_rights_list.rectification")}</li>
          <li>{t("privacy_policy_gdpr_rights_list.erasure")}</li>
          <li>{t("privacy_policy_gdpr_rights_list.restriction")}</li>
          <li>{t("privacy_policy_gdpr_rights_list.data_portability")}</li>
          <li>{t("privacy_policy_gdpr_rights_list.objection")}</li>
        </ul>
        <p>{t("privacy_policy_gdpr_rights_note")}</p>

        <h2>{t("privacy_policy_changes_title")}</h2>
        <p>{t("privacy_policy_changes_intro")}</p>

        <h2>{t("privacy_policy_contact_title")}</h2>
        <p>{t("privacy_policy_contact_intro")}</p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
