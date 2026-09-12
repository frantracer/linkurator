"use client"

import Link from "next/link"
import Image from "next/image"
import Button from "../components/atoms/Button"
import Collapse from "../components/atoms/Collapse";
import FlexColumn from "../components/atoms/FlexColumn";
import ThemeToggleButton from "../components/molecules/ThemeToggleButton";
import LogoCarousel from "../components/molecules/LogoCarousel";
import Carousel from "../components/molecules/Carousel";
import LanguageSelector from "../components/molecules/LanguageSelector";
import {LogoImage} from "../components/atoms/LogoImage";
import FlexRow from "../components/atoms/FlexRow";
import FlexItem from "../components/atoms/FlexItem";
import {useTranslations} from "next-intl";
import {LinkedinIcon, GithubIcon} from "../components/atoms/Icons";
import {useEffect} from "react";
import useProfile from "../hooks/useProfile";
import {paths} from "../configuration";
import {useRouter} from "next/navigation";

export default function LandingPage() {
  const t = useTranslations("common");
  const router = useRouter();
  const {profile, profileIsLoading} = useProfile();

  useEffect(() => {
    if (!profileIsLoading && profile) {
      router.push(paths.HOME);
    }
  }, [router, profile, profileIsLoading]);

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
      <div className="sticky top-0 z-10 flex flex-row items-center justify-between
        m-1 min-h-16 border-b-2 border-neutral bg-base-100 text-base-content">
        <FlexRow position={"start"}>
          <FlexItem whiteSpace={true}/>
          <LogoImage/>
          <span className="text-xl font-bold">Linkurator</span>
        </FlexRow>
        <FlexRow position={"center"} hideOnMobile={true}>
          <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
            {t("how_it_works")}
          </Link>
          <div className={"w-4"}/>
          <Link href="#integrations" className="text-sm font-medium hover:underline underline-offset-4">
            {t("integrations")}
          </Link>
          <div className={"w-4"}/>
          <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4">
            {t("about")}
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
          <div className={"w-4"}/>
        </FlexRow>
      </div>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full pt-12 pb-12 px-6 bg-base-200">
          <div className="mx-auto container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_600px] lg:gap-12 xl:grid-cols-[1fr_700px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-12 py-4">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    {t("hero_title")}
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    {t("hero_subtitle_1")}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative overflow-hidden rounded-xl border shadow-xl">
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

        {/* No Algorithm Callout */}
        <section className="w-full pt-12 pb-12 px-6 bg-base-100">
          <div className="mx-auto container px-4 md:px-6 text-center">
            <p className="text-xl md:text-2xl font-bold tracking-tight text-primary">
              {t("no_algorithm_statement")}
            </p>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              {t("no_algorithm_subtitle")}
            </p>
          </div>
        </section>

        {/* Trending Curations */}
        <section id="trending-curations" className="w-full pt-12 pb-12 px-2 bg-base-200">
          <FlexColumn position={"center"}>
            <h2 className="text-2xl font-bold text-center">{t("trending_curations")}</h2>
            <Carousel ariaLabel={t("trending_curations")}>
              {[
                {title: t("geopolitics_topic"), link: "/topics/8b281f83-c3b0-4846-866b-a1521ed39670"},
                {title: t("programming_topic"), link: "/topics/f5e01f25-64b1-4b9c-b0a3-75769fe0d617"},
                {title: t("cooking_topic"), link: "/topics/9ebf46b2-be81-48fc-8124-50e98f9c7436"},
                {title: t("science_topic"), link: "/topics/b502f236-1716-4e2c-bd7d-3d943741897c"},
              ].map((category, i) => (
                <div key={i} className="w-48 h-28 rounded-xl border bg-base-100 shadow-xl
                  flex flex-col items-center justify-center gap-2 px-4 text-center">
                  <h3 className="font-semibold">{category.title}</h3>
                  <Button href={category.link}>{t("explore_now")}</Button>
                </div>
              ))}
            </Carousel>
          </FlexColumn>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="w-full pt-12 pb-12 px-6 bg-base-100">
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
                  title: t("filter_step"),
                  description: t("filter_step_subtitle"),
                  icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                             stroke="currentColor"
                             className="size-10">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"/>
                  </svg>,
                },
                {
                  title: t("share_step"),
                  description: t("share_step_subtitle"),
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

        {/* Integrations Section */}
        <section id="integrations" className="w-full pt-12 pb-12 px-2 bg-base-200">
          <FlexColumn position={"center"}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t("integrations")}</h2>
                <p
                  className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t("integrations_subtitle")}
                </p>
              </div>
            </div>
            <LogoCarousel items={[
              {src: "/youtube_icon.webp", alt: "YouTube logo", label: "YouTube"},
              {src: "/spotify_icon.webp", alt: "Spotify logo", label: "Spotify"},
              {src: "/rss_icon.webp", alt: "RSS logo", label: "RSS"},
              {src: "/patreon_icon.webp", alt: "Patreon logo", label: "Patreon"},
              {src: "/podimo_icon.webp", alt: "Podimo logo", label: "Podimo (" + t("soon") + ")"},
              {src: "/substack_icon.webp", alt: "Substack logo", label: "Substack (" + t("soon") + ")"},
            ]}/>
          </FlexColumn>
        </section>

        {/* Who We Are */}
        <section id="about" className="w-full pt-12 pb-12 px-6 bg-base-100">
          <FlexColumn position={"center"}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-2xl">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border shadow-sm bg-primary/10">
                <Image
                  src="/frantracer.jpg"
                  alt="Fran, creator of Linkurator"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t("about_title")}</h2>
              <p className="text-muted-foreground md:text-xl/relaxed">{t("about_description_1")}</p>
              <p className="text-muted-foreground md:text-xl/relaxed">{t("about_description_2")}</p>
              <Button href="https://www.linkedin.com/in/frantracer/" primary={false}>
                <LinkedinIcon/>
                {t("about_linkedin_cta")}
              </Button>
            </div>
          </FlexColumn>
        </section>

        {/* Open Source */}
        <section id="open-source" className="w-full pt-12 pb-12 px-6 bg-base-200">
          <FlexColumn position={"center"}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t("open_source_title")}</h2>
              <p className="text-muted-foreground md:text-xl/relaxed">{t("open_source_trust")}</p>
              <p className="text-muted-foreground md:text-xl/relaxed">{t("open_source_description")}</p>
              <Button href="https://github.com/frantracer/linkurator" primary={false}>
                <GithubIcon/>
                {t("open_source_cta")}
              </Button>
            </div>
          </FlexColumn>
        </section>

        {/* Call to Action Section */}
        <section id="signup" className="w-full pt-12 pb-12 px-6 bg-base-100">
          <FlexColumn position={"center"}>
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">{t("ready_to_start")}</h2>
                <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl/relaxed">
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
        <section id="faq" className="w-full pt-12 pb-12 px-6 bg-base-200">
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
              {t("hero_subtitle_1")}
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
                  <Link href="#integrations" className="text-muted-foreground hover:text-foreground">
                    {t("integrations")}
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
                  <Link href="https://github.com/frantracer/linkurator"
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
            <ThemeToggleButton/>
            <div className="text-center text-sm text-muted-foreground md:text-left">
              © {new Date().getFullYear()} Linkurator. {t("all_rights_reserved")}
            </div>
          </div>
        </FlexRow>
      </footer>
    </div>
  )
}

