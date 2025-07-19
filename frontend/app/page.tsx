"use client"

import Link from "next/link"
import Image from "next/image"
import Button from "../components/atoms/Button"
import Collapse from "../components/atoms/Collapse";
import FlexColumn from "../components/atoms/FlexColumn";
import ThemeToogleButton from "../components/molecules/ThemeToogleButton";
import Card from "../components/molecules/Card";
import LanguageSelector from "../components/molecules/LanguageSelector";
import {LogoImage} from "../components/atoms/LogoImage";
import FlexRow from "../components/atoms/FlexRow";
import FlexItem from "../components/atoms/FlexItem";
import TopTitle from "../components/molecules/TopTitle";
import {useTranslations} from "next-intl";
import {BookmarkSquared, ThumbsUpIcon, LinkedinIcon, RectangleGroup, UserIconFilled} from "../components/atoms/Icons";

export default function LandingPage() {
  const t = useTranslations("common");

  const faqItems = [
    {
      question: t("faq_question_1"),
      answer: t("faq_answer_1"),
    },
    {
      question: t("faq_question_2"),
      answer: t("faq_answer_2"),
    },
    {
      question: t("faq_question_3"),
      answer: t("faq_answer_3")
    },
    {
      question: t("faq_question_4"),
      answer: t("faq_answer_4"),
    },
    {
      question: t("faq_question_5"),
      answer: t("faq_answer_5"),
    },
    {
      question: t("faq_question_6"),
      answer: t("faq_answer_6"),
    },
  ]

  return (
    <div className="w-full h-full">
      <TopTitle>
        <FlexRow position={"start"}>
          <FlexItem whiteSpace={true}/>
          <LogoImage/>
          <span className="text-xl font-bold">Linkurator</span>
        </FlexRow>
        <FlexRow position={"center"} hideOnMobile={true}>
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
            {t("features")}
          </Link>
          <div className={"w-4"}/>
          <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
            {t("how_it_works")}
          </Link>
          <div className={"w-4"}/>
          <Link href="#testimonials" className="text-sm font-medium hover:underline underline-offset-4">
            {t("testimonials")}
          </Link>
          <div className={"w-4"}/>
          <Link href="#faq" className="text-sm font-medium hover:underline underline-offset-4">
            {t("faq")}
          </Link>
        </FlexRow>
        <FlexRow position={"end"}>
          <Button href="/register" primary={false}>
            {t("sign_up")}
          </Button>
          <Button href={"/login"}>
            {t("log_in")}
          </Button>
        </FlexRow>
      </TopTitle>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-base-200">
          <div className="mx-auto container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_600px] lg:gap-12 xl:grid-cols-[1fr_700px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    {t("hero_title")}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {t("hero_subtitle_1")}
                  </p>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {t("hero_subtitle_2")}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button href={"/register"}>
                    {t("sign_up")}
                  </Button>
                  <Button href={"#trending-curations"} primary={false}>
                    {t("explore_now")}
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative overflow-visible rounded-xl border shadow-xl">
                  <Image
                    src="/linkurator_main_page.png"
                    width={2787}
                    height={1441}
                    alt="Linkurator app interface"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Curations */}
        <section id="trending-curations" className="w-full py-8 bg-base-100">
          <FlexColumn position={"center"}>
            <h2 className="text-2xl font-bold text-center">{t("trending_curations")}</h2>
            <div className="container px-4 md:px-6">
              <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4
              justify-items-center justify-content-center">
                {[
                  {title: t("geopolitics_topic"), link: "/topics/8b281f83-c3b0-4846-866b-a1521ed39670"},
                  {title: t("programming_topic"), link: "/topics/f5e01f25-64b1-4b9c-b0a3-75769fe0d617"},
                  {title: t("cooking_topic"), link: "/topics/9ebf46b2-be81-48fc-8124-50e98f9c7436"},
                  {title: t("science_topic"), link: "/topics/b502f236-1716-4e2c-bd7d-3d943741897c"},
                ].map((category, i) => (
                  <div key={i} className="card bg-base-100 w-72 shadow-xl overflow-visible rounded-xl border">
                    <div className="card-body items-center text-center">
                      <h2 className="card-title">{category.title}</h2>
                      <div className="card-actions">
                        <Button href={category.link}>{t("explore_now")}</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FlexColumn>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-base-200">
          <FlexColumn position={"center"}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t("how_it_works")}</h2>
                <p
                  className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("how_it_works_subtitle")}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-4">
              {[
                {
                  title: t("aggregate"),
                  description: t("aggregate_subtitle"),
                  icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                             stroke="currentColor"
                             className="size-10">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9"/>
                  </svg>,
                },
                {
                  title: t("organize"),
                  description: t("organize_subtitle"),
                  icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                             stroke="currentColor"
                             className="size-10">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z"/>
                  </svg>,
                },
                {
                  title: t("filter_and_recommend"),
                  description: t("filter_and_recommend_subtitle"),
                  icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                             stroke="currentColor"
                             className="size-10">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"/>
                  </svg>,
                },
                {
                  title: t("discover_and_follow"),
                  description: t("discover_and_follow_subtitle"),
                  icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                             className="size-10">
                    <path fillRule="evenodd"
                          d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                          clipRule="evenodd"/>
                  </svg>,
                },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    {step.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </FlexColumn>
        </section>

        {/* Interactive Demo */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-base-100">
          <FlexColumn position={"center"}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t("watch_video")}</h2>
                <p
                  className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("watch_video_subtitle")}
                </p>
              </div>
              <iframe
                className={"aspect-video"}
                width={"100%"}
                src="https://www.youtube.com/embed/7EcJGmXnnpM?si=dPuDftY9V7P86J9k"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen/>
            </div>
          </FlexColumn>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-base-200">
          <FlexColumn position={"center"}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t("features")}</h2>
                <p
                  className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("features_subtitle")}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  {[
                    {
                      title: t("features_list.feature_1_title"),
                      description: t("features_list.feature_1_subtitle"),
                      icon: <BookmarkSquared/>,
                    },
                    {
                      title: t("features_list.feature_2_title"),
                      description: t("features_list.feature_2_subtitle"),
                      icon: <RectangleGroup/>,
                    },
                    {
                      title: t("features_list.feature_3_title"),
                      description: t("features_list.feature_3_subtitle"),
                      icon: <UserIconFilled/>,
                    },
                    {
                      title: t("features_list.feature_4_title"),
                      description: t("features_list.feature_4_subtitle"),
                      icon: <ThumbsUpIcon/>,
                    },
                  ].map((feature, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        {feature.icon}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={"container max-w-5xl"}>
              <FlexColumn position={"start"}>
                <FlexRow position={"start"} wrap={false}>
                  <FlexRow position={"start"} wrap={false}>
                    <Image
                      src="/youtube_icon.webp"
                      width={60}
                      height={60}
                      alt="YouTube logo"
                      className="h-8 object-contain"
                    />
                    <span>YouTube</span>
                  </FlexRow>
                  <FlexRow position={"start"} wrap={false}>
                    <Image
                      src="/spotify_icon.webp"
                      width={60}
                      height={60}
                      alt="Spotify logo"
                      className="h-8 object-contain"
                    />
                    <span>Spotify</span>
                  </FlexRow>

                  <FlexRow position={"start"} wrap={false}>
                    <Image
                      src="/rss_icon.webp"
                      width={60}
                      height={60}
                      alt="RSS logo"
                      className="h-8 object-contain"
                    />
                    <span>{"RSS (" + t("soon") + ")"}</span>
                  </FlexRow>
                </FlexRow>
                <FlexRow position={"start"} wrap={false}>

                  <FlexRow position={"start"} wrap={false}>
                    <Image
                      src="/patreon_icon.webp"
                      width={60}
                      height={60}
                      alt="Patreon logo"
                      className="h-8 object-contain"
                    />

                    <span>{"Patreon (" + t("soon") + ")"}</span>
                  </FlexRow>
                  <FlexRow position={"start"} wrap={false}>
                    <Image
                      src="/podimo_icon.webp"
                      width={60}
                      height={60}
                      alt="Podimo logo"
                      className="h-8 object-contain"
                    />
                    <span>{"Podimo (" + t("soon") + ")"}</span>
                  </FlexRow>
                </FlexRow>
              </FlexColumn>
            </div>
          </FlexColumn>
        </section>

        {/* Social Proof & Testimonials */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-base-100">
          <FlexColumn position={"center"}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t("testimonials")}</h2>
                <p
                  className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("testimonials_subtitle")}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
              {[
                {
                  quote: t("testimonial_1.quote"),
                  author: t("testimonial_1.author")
                },
                {
                  quote: t("testimonial_2.quote"),
                  author: t("testimonial_2.author")
                },
                {
                  quote: t("testimonial_3.quote"),
                  author: t("testimonial_3.author")
                },
              ].map((testimonial, i) => (
                <Card key={i} title={testimonial.quote}>
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-1 h-12 w-12 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">{testimonial.author[0]}</span>
                    </div>
                    <div>
                      <h4>{testimonial.author}</h4>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </FlexColumn>
        </section>

        <section id="signup" className="w-full py-12 md:py-24 lg:py-32 bg-base-200">
          <FlexColumn position={"center"}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t("ready_to_start")}</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  {t("ready_to_start_subtitle")}
                </p>
              </div>
              <Button href={"/register"}>
                {t("sign_up")}
              </Button>
            </div>
          </FlexColumn>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-base-100">
          <FlexColumn position={"center"}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t("faq")}</h2>
                <p
                  className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("faq_subtitle")}
                </p>
              </div>
            </div>
            <div className="w-full max-w-3xl space-y-4 py-12">
              <FlexColumn>
                {
                  faqItems.map((item, index) => (
                    <Collapse key={index} title={item.question} isOpen={false} content={item.answer}/>
                  ))
                }
              </FlexColumn>
            </div>
          </FlexColumn>
        </section>
      </main>
      <footer className="w-full border-t bg-background">
        <div className="container flex flex-col gap-8 px-4 py-10 md:px-6 lg:flex-row lg:gap-12">
          <div className="flex flex-col gap-4 lg:w-1/3">
            <div className="flex items-center gap-2">
              <LogoImage/>
              <span className="text-xl font-bold">Linkurator</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("hero_subtitle_1") + " " + t("hero_subtitle_2")}
            </p>
            <div className="flex gap-4">
              <Button href="https://www.linkedin.com/company/linkurator">
                <LinkedinIcon/>
                <span className="sr-only">LinkedIn</span>
              </Button>
            </div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">{t("product")}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-foreground">
                    {t("features")}
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="text-muted-foreground hover:text-foreground">
                    {t("faq")}
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">{t("company")}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="mailto:admin@linkurator.com" className="text-muted-foreground hover:text-foreground">
                    {t("contact")}
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">{t("resources")}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="https://api.linkurator.com/docs" className="text-muted-foreground hover:text-foreground">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="https://github.com/frantracer/linkurator-frontend"
                        className="text-muted-foreground hover:text-foreground">
                    {t("source_code")}
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium">{t("legal")}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/tos" className="text-muted-foreground hover:text-foreground">
                    {t("terms_of_service")}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                    {t("privacy_policy")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <FlexRow position={"center"} hideOverflow={true}>
          <div className="flex items-center gap-2 px-4 py-2 w-full">
            <LanguageSelector/>
            <FlexItem grow={true}/>
            <ThemeToogleButton/>
            <div className="text-center text-sm text-muted-foreground md:text-left">
              © {new Date().getFullYear()} Linkurator. {t("all_rights_reserved")}
            </div>
          </div>
        </FlexRow>
      </footer>
    </div>
  )
}

