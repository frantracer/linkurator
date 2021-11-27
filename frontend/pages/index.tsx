import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import LateralMenu from "../components/LateralMenu";
import VideoCard from "../components/VideoCard";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const cards = [];

  for (let i = 0; i < 25; i++) {
    cards.push(
      <div className="m-4">
        <VideoCard
          img="https://via.placeholder.com/150"
          name="Item name"
          description="Item description"
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

      <main className="flex">
        <LateralMenu
          onClickTopic={(topic) => console.log(`Clicked on ${topic}`)}
        />

        <div className="flex flex-row flex-wrap">{cards}</div>
      </main>

      <footer className={styles.footer}>Footer</footer>
    </div>
  );
};

export default Home;
