import { set } from "msw/lib/types/context";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import LateralMenu from "../components/LateralMenu";
import VideoCard from "../components/VideoCard";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [selectedTopic, setSelectedTopic] = useState("No selected topic");
  const cards = [];

  for (let i = 0; i < 25; i++) {
    cards.push(
      <div className="m-4">
        <VideoCard
          img={`https://cataas.com/cat?fff=${Math.random()}`}
          name={selectedTopic}
          description={`Description for ${selectedTopic}`}
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
        <LateralMenu onClickTopic={(topic) => setSelectedTopic(topic)} />

        <div className="flex flex-row flex-wrap m-6">{cards}</div>
      </main>
    </div>
  );
};

export default Home;
