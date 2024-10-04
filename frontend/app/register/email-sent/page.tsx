'use client';

import type {NextPage} from "next";
import FlexColumn from "../../../components/atoms/FlexColumn";
import LinkuratorHeader from "../../../components/organism/LinkuratorHeader";
import React from "react";

const EmailSent: NextPage = () => {
  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content">
        <div className="max-w-md">
          <LinkuratorHeader/>

          <FlexColumn>
            <h2 className="text-3xl font-bold py-5">{"Hemos enviado un email a tu dirección de correo electrónico"}</h2>
            <p>{"Por favor, sigue las instrucciones para completar el proceso de registro"}</p>
          </FlexColumn>
        </div>
      </div>
    </main>
  );
}

export default EmailSent;