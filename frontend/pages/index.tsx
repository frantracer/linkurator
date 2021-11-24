import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import LateralMenu from "../components/LateralMenu";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Linkurator</title>
        <meta name="description" content="Linkurator" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <LateralMenu items={["Blog", "Portfolio", "About", "Contact"]} />
      </main>

      <footer className={styles.footer}>Footer</footer>
    </div>
  );
};

export default Home;
