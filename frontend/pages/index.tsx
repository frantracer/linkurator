import { set } from "msw/lib/types/context";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import LateralMenu from "../components/LateralMenu";
import VideoCard from "../components/VideoCard";
import useTopics, { Topic } from "../hooks/useTopics";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic | undefined>();
  const topics = useTopics();
  const cards = [];

  const topicName = selectedTopic?.name ?? "No selected topic";
  for (let i = 0; i < 25; i++) {
    cards.push(
      <div className="m-4">
        <VideoCard
          img={`https://cataas.com/cat/gif?fff=${Math.random()}`}
          name={topicName}
          description={`Description for ${topicName}`}
          key={i}
        />
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>Linkurator</title>
        <meta name="description" content="Linkurator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex bg-gray-100">
        <LateralMenu
          topics={topics}
          onClickTopic={(topic) => setSelectedTopic(topic)}
        />

        <div className="flex flex-row flex-wrap m-6">{cards}</div>
      </main>
    </div>
  );
};

export default Home;
