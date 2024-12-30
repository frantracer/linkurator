'use client';

import type {NextPage} from "next";
import React, {useEffect} from "react";
import useProfile from "../hooks/useProfile";
import {configuration, paths} from "../configuration";
import {useRouter} from "next/navigation";
import Button from "../components/atoms/Button";
import FlexColumn from "../components/atoms/FlexColumn";
import Divider from "../components/atoms/Divider";
import FlexRow from "../components/atoms/FlexRow";
import LinkuratorHeader from "../components/organism/LinkuratorHeader";
import FlexItem from "../components/atoms/FlexItem";
import LanguageSelector from "../components/molecules/LanguageSelector";
import { useTranslations } from "next-intl";

const Home: NextPage = () => {
  const t = useTranslations("common");
  const router = useRouter();
  const {profile, profileIsLoading} = useProfile();

  useEffect(() => {
    if (!profileIsLoading && profile) {
      router.push(paths.TOPICS)
    }
  }, [router, profile, profileIsLoading]);

  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <FlexRow position="end">
            <LanguageSelector/>
          </FlexRow>
          <LinkuratorHeader/>
          <h2 className="text-3xl font-bold py-5">{t("hero_title")}</h2>
          <p className="py-2">{t("hero_subtitle_1")}</p>
          <p className="py-2">{t("hero_subtitle_2")}</p>
          <p className="py-2">{t("hero_subtitle_3")}</p>
          <div className="w-full">
            <FlexRow>
              <FlexItem grow={true}>
                <Button href={configuration.EXAMPLE_GEOPOLITICS_TOPIC_URL} fitContent={false}>{t("geopolitics_topic")}</Button>
              </FlexItem>
              <FlexItem grow={true}>
                <Button href={configuration.EXAMPLE_VIDEO_GAMES_NEWS_TOPIC_URL} fitContent={false}>{t("video_games_news_topic")}</Button>
              </FlexItem>
            </FlexRow>
          </div>

          <div className="m-8">
            <FlexColumn>
              <Divider/>
              <p>{t("have_account")}</p>
              <Button href={paths.LOGIN} fitContent={false}>{t("log_in")}</Button>
              <p>{t("do_not_have_account")}</p>
              <Button href={paths.REGISTER} fitContent={false}>{t("sign_up")}</Button>
            </FlexColumn>
          </div>
        </div>
      </div>
    </main>
  )
};

export default Home;
